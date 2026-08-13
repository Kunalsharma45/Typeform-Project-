import os
import django
import sys
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from forms.models import Form, Question

form = Form.objects.get(id=3)

# Clear existing questions for clean slate
Question.objects.filter(form=form).delete()

# Create Q1 (Dropdown)
q1 = Question.objects.create(
    form=form,
    type="dropdown",
    title="Which path do you choose?",
    order_index=1,
    options=[{"id": "opt_a", "label": "Option A"}, {"id": "opt_b", "label": "Option B"}]
)

# Create Q2 (Short Text)
q2 = Question.objects.create(
    form=form,
    type="short_text",
    title="You chose A. Tell me a secret.",
    order_index=2
)

# Create Q3 (Long Text)
q3 = Question.objects.create(
    form=form,
    type="long_text",
    title="You chose B. Write an essay.",
    order_index=3
)

# Create Q4 (Number)
q4 = Question.objects.create(
    form=form,
    type="number",
    title="Common destination.",
    order_index=4
)

# Add logic rules to Q1 — condition.value must match the option *id* that
# the respondent flow sends as selected_option_id (not the label text).
q1.logic_rules = [
    {
        "id": "rule_a",
        "condition": {"operator": "equals", "value": "opt_a"},
        "target_question_id": q2.id,
        "target_is_ending": False
    },
    {
        "id": "rule_b",
        "condition": {"operator": "equals", "value": "opt_b"},
        "target_question_id": q3.id,
        "target_is_ending": False
    }
]
q1.save()

# Default next for Q2 and Q3 to converge on Q4
q2.default_next_question_id = q4.id
q2.save()
q3.default_next_question_id = q4.id
q3.save()

print(f"Seed complete. Slug is {form.public_slug}")
