"""
Verification script — prints the exact state of Q1-Q4 on form 3,
so we can confirm condition.value, option ids, and default_next all line up.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from forms.models import Question, Form
import json

form = Form.objects.get(id=3)
questions = list(form.questions.order_by('order_index'))

for q in questions:
    print(f"\n--- Q{q.order_index}: {q.title!r} (id={q.id}, type={q.type}) ---")
    if q.options:
        print(f"  options: {json.dumps(q.options)}")
    if q.logic_rules:
        print(f"  logic_rules:")
        for r in q.logic_rules:
            print(f"    {json.dumps(r)}")
    if q.default_next_question_id:
        print(f"  default_next_question_id: {q.default_next_question_id}")
    if q.default_next_is_ending:
        print(f"  default_next_is_ending: True")
