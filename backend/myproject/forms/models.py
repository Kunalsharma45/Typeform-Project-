from django.db import models
from django.contrib.auth.models import User


class Form(models.Model):
    STATUS_CHOICES = [("draft", "Draft"), ("published", "Published")]
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forms")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    public_slug = models.SlugField(unique=True, null=True, blank=True)
    theme = models.JSONField(default=dict, blank=True)
    welcome_screen = models.JSONField(default=dict, blank=True)
    thankyou_screen = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    TYPE_CHOICES = [
        ("short_text", "Short Text"),
        ("long_text", "Long Text"),
        ("multiple_choice", "Multiple Choice"),
        ("dropdown", "Dropdown"),
        ("email", "Email"),
        ("number", "Number"),
        ("yes_no", "Yes/No"),
        ("rating", "Rating"),
        ("file_upload", "File Upload"),
    ]
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="questions")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=500, blank=True, default="")
    description = models.CharField(max_length=500, blank=True, default="")
    order_index = models.PositiveIntegerField()
    required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)
    logic = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index"]

    def __str__(self):
        return f"{self.form.title} – {self.title[:50]}"


class Response(models.Model):
    STATUS_CHOICES = [("partial", "Partial"), ("completed", "Completed")]
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="responses")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="partial")
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    respondent_meta = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Response {self.id} – {self.form.title} ({self.status})"


class Answer(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    value = models.JSONField()
    file = models.FileField(upload_to="answer_uploads/%Y/%m/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("response", "question")

    def __str__(self):
        return f"Answer to Q{self.question_id} in Response {self.response_id}"
