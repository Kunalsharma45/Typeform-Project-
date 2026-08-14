from django.urls import path
from . import views

urlpatterns = [
    # ── Creator: Forms ──────────────────────────────────────────────────────
    path("forms/", views.FormListCreateView.as_view(), name="form-list-create"),
    path("forms/<int:pk>/", views.FormDetailView.as_view(), name="form-detail"),
    path("forms/<int:pk>/duplicate/", views.FormDuplicateView.as_view(), name="form-duplicate"),
    path("forms/<int:pk>/publish/", views.FormPublishView.as_view(), name="form-publish"),
    path("forms/<int:pk>/unpublish/", views.FormUnpublishView.as_view(), name="form-unpublish"),

    # ── Creator: Questions ──────────────────────────────────────────────────
    path("forms/<int:form_id>/questions/", views.QuestionListCreateView.as_view(), name="question-list-create"),
    path("questions/<int:pk>/", views.QuestionDetailView.as_view(), name="question-detail"),
    path("questions/<int:pk>/move/", views.QuestionMoveView.as_view(), name="question-move"),
    path("pages/<int:pk>/split/", views.PageSplitView.as_view(), name="page-split"),
    # path("forms/<int:form_id>/questions/reorder/", views.QuestionReorderView.as_view(), name="question-reorder"), # Deprecated in favor of QuestionMoveView

    # ── Creator: Responses & Summary ───────────────────────────────────────
    path("forms/<int:form_id>/responses/", views.ResponseListView.as_view(), name="response-list"),
    path("forms/<int:form_id>/responses/export/", views.ResponsesExportView.as_view(), name="response-export"),
    path("forms/<int:form_id>/summary/", views.FormSummaryView.as_view(), name="form-summary"),
    path("responses/<int:pk>/", views.ResponseDetailView.as_view(), name="response-detail"),

    # ── Workflow: Logic Map (Branching canvas) ──────────────────────────────
    path("forms/<int:form_id>/logic-map/", views.FormLogicMapView.as_view(), name="form-logic-map"),
    path("questions/<int:pk>/logic/", views.QuestionLogicUpdateView.as_view(), name="question-logic-update"),
    path("questions/<int:pk>/logic/<str:rule_id>/", views.QuestionLogicRuleDeleteView.as_view(), name="question-logic-rule-delete"),

    # ── Public: Respondent flow ─────────────────────────────────────────────
    path("public/forms/<str:slug>/", views.PublicFormDetailView.as_view(), name="public-form-detail"),
    path("public/forms/<str:slug>/start/", views.PublicFormStartView.as_view(), name="public-form-start"),
    path("public/responses/<int:response_id>/answer/", views.PublicResponseAnswerView.as_view(), name="public-response-answer"),
    path("public/responses/<int:response_id>/submit/", views.PublicResponseSubmitView.as_view(), name="public-response-submit"),
]

