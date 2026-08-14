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


class Page(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="pages")
    order_index = models.PositiveIntegerField()

    class Meta:
        ordering = ["order_index"]

    def __str__(self):
        return f"Page {self.order_index} of {self.form.title}"


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
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="questions")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=500, blank=True, default="")
    description = models.CharField(max_length=500, blank=True, default="")
    order_index = models.PositiveIntegerField()
    order_in_page = models.PositiveIntegerField(default=0)
    required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)

    # Legacy single-rule branching field (kept for backward compat, not used for new rules)
    logic = models.JSONField(null=True, blank=True)

    # New structured branching fields
    # List of rule objects: [{id, condition: {operator, value}, target_question_id, target_is_ending}]
    logic_rules = models.JSONField(default=list, blank=True)
    # Fallback target if no rule matches. None = next question in order_index order.
    default_next_question_id = models.IntegerField(null=True, blank=True)
    default_next_is_ending = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # We preserve order_index as primary fallback, but order_in_page dictates page position
        ordering = ["order_index", "order_in_page"]

    def __str__(self):
        return f"{self.form.title} – {self.title[:50]}"

    def delete(self, *args, **kwargs):
        """
        Before deleting this question, remove any logic_rules across sibling questions
        that reference this question's id, and clear default_next_question_id if it pointed here.
        """
        deleted_id = self.id
        siblings = Question.objects.filter(form=self.form).exclude(id=deleted_id)
        for sibling in siblings:
            changed = False
            # Filter out rules whose target_question_id matches this deleted question
            new_rules = []
            for rule in (sibling.logic_rules or []):
                if rule.get("target_question_id") == deleted_id:
                    changed = True  # drop this rule
                else:
                    new_rules.append(rule)
            # Clear default_next_question_id if it pointed at the deleted question
            if sibling.default_next_question_id == deleted_id:
                sibling.default_next_question_id = None
                changed = True
            if changed:
                sibling.logic_rules = new_rules
                sibling.save(
                    update_fields=["logic_rules", "default_next_question_id"]
                )
        super().delete(*args, **kwargs)


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
