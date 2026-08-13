import csv
import uuid
from collections import defaultdict

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import HttpResponse
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response as DRFResponse
from rest_framework.views import APIView

from .models import Answer, Form, Question, Response
from .serializers import (
    AnswerSerializer,
    FormDetailSerializer,
    FormListSerializer,
    FormSummarySerializer,
    PublicFormSerializer,
    QuestionSerializer,
    ResponseDetailSerializer,
    ResponseListSerializer,
)


def get_default_user():
    """Return (or create) the single default creator user."""
    user, _ = User.objects.get_or_create(
        username="creator",
        defaults={"email": "creator@example.com"},
    )
    return user


# ─────────────────────────────────────────────────────────────────────────────
# Creator – Forms
# ─────────────────────────────────────────────────────────────────────────────


class FormListCreateView(generics.ListCreateAPIView):
    """GET /api/forms/  –  POST /api/forms/"""

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FormDetailSerializer
        return FormListSerializer

    def get_queryset(self):
        return Form.objects.all().order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(owner=get_default_user())


class FormDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PATCH / DELETE /api/forms/<id>/"""

    queryset = Form.objects.all()
    serializer_class = FormDetailSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]


class FormDuplicateView(APIView):
    """POST /api/forms/<id>/duplicate/"""

    def post(self, request, pk):
        try:
            original = Form.objects.get(pk=pk)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            new_form = Form.objects.create(
                owner=get_default_user(),
                title=f"{original.title} (Copy)",
                description=original.description,
                status="draft",
                public_slug=None,
                theme=original.theme,
                welcome_screen=original.welcome_screen,
                thankyou_screen=original.thankyou_screen,
            )
            for q in original.questions.all():
                Question.objects.create(
                    form=new_form,
                    type=q.type,
                    title=q.title,
                    description=q.description,
                    order_index=q.order_index,
                    required=q.required,
                    options=q.options,
                    logic=q.logic,
                )

        serializer = FormDetailSerializer(new_form, context={"request": request})
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)


def _generate_unique_slug(title):
    base = slugify(title) or "form"
    for _ in range(10):
        candidate = f"{base}-{uuid.uuid4().hex[:6]}"
        if not Form.objects.filter(public_slug=candidate).exists():
            return candidate
    raise IntegrityError("Could not generate a unique slug after 10 attempts")


class FormPublishView(APIView):
    """POST /api/forms/<id>/publish/"""

    def post(self, request, pk):
        try:
            form = Form.objects.get(pk=pk)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if not form.public_slug:
            form.public_slug = _generate_unique_slug(form.title)
        form.status = "published"
        form.save()
        serializer = FormDetailSerializer(form, context={"request": request})
        return DRFResponse(serializer.data)


class FormUnpublishView(APIView):
    """POST /api/forms/<id>/unpublish/"""

    def post(self, request, pk):
        try:
            form = Form.objects.get(pk=pk)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        form.status = "draft"
        form.save()
        serializer = FormDetailSerializer(form, context={"request": request})
        return DRFResponse(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
# Creator – Questions
# ─────────────────────────────────────────────────────────────────────────────


class QuestionListCreateView(APIView):
    """POST /api/forms/<form_id>/questions/"""

    def post(self, request, form_id):
        try:
            form = Form.objects.get(pk=form_id)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Form not found."}, status=status.HTTP_404_NOT_FOUND)

        max_index = form.questions.count()
        data = dict(request.data)
        # data might come in as QueryDict (lists); normalise
        data = {k: (v[0] if isinstance(v, list) and len(v) == 1 else v) for k, v in data.items()}
        data["form"] = form.id
        data["order_index"] = max_index

        serializer = QuestionSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH / DELETE /api/questions/<id>/"""

    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]


class QuestionReorderView(APIView):
    """POST /api/forms/<form_id>/questions/reorder/
    Body: [{id: int, order_index: int}, ...]
    """

    def post(self, request, form_id):
        items = request.data
        if not isinstance(items, list):
            return DRFResponse({"detail": "Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in items:
                Question.objects.filter(pk=item["id"], form_id=form_id).update(
                    order_index=item["order_index"]
                )
        return DRFResponse({"status": "ok"})


# ─────────────────────────────────────────────────────────────────────────────
# Creator – Responses & Summary
# ─────────────────────────────────────────────────────────────────────────────


class ResponseListView(generics.ListAPIView):
    """GET /api/forms/<form_id>/responses/"""

    serializer_class = ResponseListSerializer

    def get_queryset(self):
        return Response.objects.filter(form_id=self.kwargs["form_id"]).order_by("-started_at")


class ResponseDetailView(generics.RetrieveAPIView):
    """GET /api/responses/<id>/"""

    queryset = Response.objects.all()
    serializer_class = ResponseDetailSerializer


class FormSummaryView(APIView):
    """GET /api/forms/<form_id>/summary/"""

    def get(self, request, form_id):
        try:
            form = Form.objects.get(pk=form_id)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        questions = form.questions.all()
        total_responses = form.responses.count()
        completed_responses = form.responses.filter(status="completed").count()
        completion_rate = (
            round(completed_responses / total_responses * 100, 1) if total_responses else 0.0
        )

        question_summaries = []
        for q in questions:
            answers = Answer.objects.filter(question=q)
            total_answers = answers.count()

            if q.type in ("multiple_choice", "dropdown", "yes_no", "rating"):
                counts = defaultdict(int)
                for a in answers:
                    val = a.value
                    if isinstance(val, dict):
                        key = val.get("selected_option_id") or val.get("selected") or str(val)
                    else:
                        key = str(val)
                    counts[key] += 1

                if q.type in ("multiple_choice", "dropdown"):
                    option_map = {str(opt["id"]): opt["label"] for opt in q.options}
                    data = [
                        {"label": option_map.get(str(k), str(k)), "count": v}
                        for k, v in counts.items()
                    ]
                else:
                    data = [{"label": str(k), "count": v} for k, v in counts.items()]
            else:
                # text/email/number/file_upload – return raw list
                data_list = []
                for a in answers:
                    if a.file:
                        data_list.append(
                            request.build_absolute_uri(a.file.url) if a.file else str(a.value)
                        )
                    else:
                        data_list.append(str(a.value))
                data = data_list

            question_summaries.append(
                {
                    "question_id": q.id,
                    "question_title": q.title,
                    "question_type": q.type,
                    "data": data,
                    "total_answers": total_answers,
                }
            )

        payload = {
            "form_id": form.id,
            "total_responses": total_responses,
            "completed_responses": completed_responses,
            "completion_rate": completion_rate,
            "questions": question_summaries,
        }
        serializer = FormSummarySerializer(payload)
        return DRFResponse(serializer.data)


class ResponsesExportView(APIView):
    """GET /api/forms/<form_id>/responses/export/  – CSV download"""

    def get(self, request, form_id):
        try:
            form = Form.objects.get(pk=form_id)
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        questions = list(form.questions.all())
        responses = Response.objects.filter(form=form).prefetch_related("answers__question")

        http_response = HttpResponse(content_type="text/csv")
        http_response["Content-Disposition"] = (
            f'attachment; filename="form_{form_id}_responses.csv"'
        )

        writer = csv.writer(http_response)
        header = ["response_id", "status", "started_at", "completed_at"] + [
            q.title for q in questions
        ]
        writer.writerow(header)

        for resp in responses:
            answer_map = {a.question_id: a for a in resp.answers.all()}
            row = [resp.id, resp.status, resp.started_at, resp.completed_at]
            for q in questions:
                ans = answer_map.get(q.id)
                if ans is None:
                    row.append("")
                elif ans.file:
                    row.append(request.build_absolute_uri(ans.file.url))
                else:
                    row.append(str(ans.value))
            writer.writerow(row)

        return http_response


# ─────────────────────────────────────────────────────────────────────────────
# Public – Respondent flow
# ─────────────────────────────────────────────────────────────────────────────


class PublicFormDetailView(APIView):
    """GET /api/public/forms/<slug>/"""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            form = Form.objects.get(public_slug=slug, status="published")
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Form not found or not published."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicFormSerializer(form, context={"request": request})
        return DRFResponse(serializer.data)


class PublicFormStartView(APIView):
    """POST /api/public/forms/<slug>/start/
    Creates a partial Response row; returns {response_id}.
    """

    permission_classes = [AllowAny]

    def post(self, request, slug):
        try:
            form = Form.objects.get(public_slug=slug, status="published")
        except Form.DoesNotExist:
            return DRFResponse({"detail": "Form not found or not published."}, status=status.HTTP_404_NOT_FOUND)

        user_agent = request.META.get("HTTP_USER_AGENT", "")
        resp = Response.objects.create(
            form=form,
            status="partial",
            respondent_meta={"user_agent": user_agent},
        )
        return DRFResponse({"response_id": resp.id}, status=status.HTTP_201_CREATED)


class PublicResponseAnswerView(APIView):
    """POST /api/public/responses/<id>/answer/
    Upserts a single Answer for the given question.
    Accepts multipart for file_upload questions.
    """

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, response_id):
        try:
            resp = Response.objects.get(pk=response_id)
        except Response.DoesNotExist:
            return DRFResponse({"detail": "Response not found."}, status=status.HTTP_404_NOT_FOUND)

        question_id = request.data.get("question_id")
        value = request.data.get("value")
        uploaded_file = request.FILES.get("file")

        if question_id is None:
            return DRFResponse({"detail": "question_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(pk=question_id, form=resp.form)
        except Question.DoesNotExist:
            return DRFResponse({"detail": "Question not found on this form."}, status=status.HTTP_404_NOT_FOUND)

        if value is None and not uploaded_file:
            return DRFResponse({"detail": "value or file is required."}, status=status.HTTP_400_BAD_REQUEST)

        # For non-file types, parse value from JSON string if needed
        if isinstance(value, str):
            import json
            try:
                value = json.loads(value)
            except (ValueError, TypeError):
                pass  # keep as string

        defaults = {"value": value if value is not None else {}}
        if uploaded_file:
            defaults["file"] = uploaded_file
            defaults["value"] = {"filename": uploaded_file.name}

        answer, _ = Answer.objects.update_or_create(
            response=resp,
            question=question,
            defaults=defaults,
        )

        serializer = AnswerSerializer(answer, context={"request": request})
        return DRFResponse(serializer.data, status=status.HTTP_200_OK)


class PublicResponseSubmitView(APIView):
    """POST /api/public/responses/<id>/submit/
    Validates all required answers, then marks the response completed.
    """

    permission_classes = [AllowAny]

    def post(self, request, response_id):
        try:
            resp = Response.objects.get(pk=response_id)
        except Response.DoesNotExist:
            return DRFResponse({"detail": "Response not found."}, status=status.HTTP_404_NOT_FOUND)

        if resp.status == "completed":
            return DRFResponse({"detail": "Response already submitted."}, status=status.HTTP_400_BAD_REQUEST)

        questions = list(resp.form.questions.all())
        answers_by_qid = {a.question_id: a for a in resp.answers.all()}

        errors = []

        for q in questions:
            ans = answers_by_qid.get(q.id)

            # Required check
            if q.required:
                if ans is None:
                    errors.append({"question_id": q.id, "error": "This question is required."})
                    continue
                val = ans.value
                if val is None or val == "" or val == {} or val == []:
                    errors.append({"question_id": q.id, "error": "This question requires a non-empty answer."})
                    continue

            if ans is None:
                continue

            val = ans.value

            # Email validation
            if q.type == "email":
                try:
                    validate_email(str(val))
                except DjangoValidationError:
                    errors.append({"question_id": q.id, "error": "Invalid email address."})

            # Number validation
            elif q.type == "number":
                try:
                    float(str(val))
                except (ValueError, TypeError):
                    errors.append({"question_id": q.id, "error": "Answer must be a valid number."})

            # Choice validation
            elif q.type in ("multiple_choice", "dropdown"):
                option_ids = [str(opt["id"]) for opt in q.options]
                if isinstance(val, dict):
                    submitted_id = str(val.get("selected_option_id", ""))
                else:
                    submitted_id = str(val)
                if submitted_id and submitted_id not in option_ids:
                    errors.append({"question_id": q.id, "error": f"Option id '{submitted_id}' does not exist."})

        if errors:
            return DRFResponse({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        resp.status = "completed"
        resp.completed_at = timezone.now()
        resp.save()

        return DRFResponse({"status": "completed", "response_id": resp.id})
