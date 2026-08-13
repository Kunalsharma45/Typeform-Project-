from django.contrib import admin
from .models import Form, Question, Response, Answer


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "owner", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("title",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "type", "title", "order_index", "required")
    list_filter = ("type", "required")
    search_fields = ("title",)


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "status", "started_at", "completed_at")
    list_filter = ("status",)


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "response", "question", "created_at")
