from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Form, Question, Response, Answer


# ──────────────────────────────────────────────
# Question
# ──────────────────────────────────────────────

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id", "form", "type", "title", "description",
            "order_index", "required", "options", "logic",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# ──────────────────────────────────────────────
# Form
# ──────────────────────────────────────────────

class FormListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the dashboard list view."""
    response_count = serializers.SerializerMethodField()

    class Meta:
        model = Form
        fields = [
            "id", "title", "description", "status", "public_slug",
            "theme", "response_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_response_count(self, obj):
        return obj.responses.count()


class FormDetailSerializer(serializers.ModelSerializer):
    """Full form with ordered nested questions – used by creator and public endpoints."""
    questions = QuestionSerializer(many=True, read_only=True)
    response_count = serializers.SerializerMethodField()

    class Meta:
        model = Form
        fields = [
            "id", "title", "description", "status", "public_slug",
            "theme", "welcome_screen", "thankyou_screen",
            "questions", "response_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_response_count(self, obj):
        return obj.responses.count()


# PublicFormSerializer re-uses FormDetailSerializer (same shape, different permission context)
PublicFormSerializer = FormDetailSerializer


# ──────────────────────────────────────────────
# Answer
# ──────────────────────────────────────────────

class AnswerSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    question_title = serializers.CharField(source="question.title", read_only=True)
    question_type = serializers.CharField(source="question.type", read_only=True)

    class Meta:
        model = Answer
        fields = [
            "id", "response", "question", "question_title", "question_type",
            "value", "file", "file_url", "created_at",
        ]
        read_only_fields = ["id", "created_at", "file_url", "question_title", "question_type"]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


# ──────────────────────────────────────────────
# Response
# ──────────────────────────────────────────────

class ResponseListSerializer(serializers.ModelSerializer):
    answer_count = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = [
            "id", "form", "status", "started_at", "completed_at",
            "respondent_meta", "answer_count",
        ]
        read_only_fields = ["id", "started_at"]

    def get_answer_count(self, obj):
        return obj.answers.count()


class ResponseDetailSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Response
        fields = [
            "id", "form", "status", "started_at", "completed_at",
            "respondent_meta", "answers",
        ]
        read_only_fields = ["id", "started_at"]


# ──────────────────────────────────────────────
# Summary (per-question aggregate)
# ──────────────────────────────────────────────

class QuestionSummarySerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    question_title = serializers.CharField()
    question_type = serializers.CharField()
    # For choice/yes_no/rating: list of {label, count}
    # For text/email/number: list of raw string values
    data = serializers.ListField()
    total_answers = serializers.IntegerField()


class FormSummarySerializer(serializers.Serializer):
    form_id = serializers.IntegerField()
    total_responses = serializers.IntegerField()
    completed_responses = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    questions = QuestionSummarySerializer(many=True)
