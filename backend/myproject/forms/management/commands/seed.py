"""
Seed management command.
Run with: python manage.py seed
Creates:
  - 1 default creator user
  - 2 published forms (6+ questions each, mixed types)
  - 1 draft form
  - 5-8 responses per published form (mostly completed, some partial)
"""
import random
import uuid
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from forms.models import Answer, Form, Page, Question, Response


CUSTOMER_FEEDBACK_QUESTIONS = [
    {
        "type": "short_text",
        "title": "What is your name?",
        "description": "First and last name, please.",
        "required": True,
        "options": [],
    },
    {
        "type": "email",
        "title": "What is your email address?",
        "description": "We'll use this to follow up if needed.",
        "required": True,
        "options": [],
    },
    {
        "type": "rating",
        "title": "How would you rate your overall experience?",
        "description": "1 = Very Poor, 5 = Excellent",
        "required": True,
        "options": {"max": 5},
    },
    {
        "type": "multiple_choice",
        "title": "Which product did you purchase?",
        "description": "",
        "required": True,
        "options": [
            {"id": "p1", "label": "Starter Plan"},
            {"id": "p2", "label": "Pro Plan"},
            {"id": "p3", "label": "Enterprise Plan"},
            {"id": "p4", "label": "Other"},
        ],
    },
    {
        "type": "yes_no",
        "title": "Would you recommend us to a friend or colleague?",
        "description": "",
        "required": True,
        "options": [],
    },
    {
        "type": "number",
        "title": "How many team members use our product?",
        "description": "Enter an approximate number.",
        "required": False,
        "options": [],
    },
    {
        "type": "long_text",
        "title": "What could we do better?",
        "description": "Be as specific as you like — we read every response.",
        "required": False,
        "options": [],
    },
]

JOB_APPLICATION_QUESTIONS = [
    {
        "type": "short_text",
        "title": "Full name",
        "description": "As it appears on your ID.",
        "required": True,
        "options": [],
    },
    {
        "type": "email",
        "title": "Email address",
        "description": "We'll send updates to this address.",
        "required": True,
        "options": [],
    },
    {
        "type": "number",
        "title": "Years of professional experience in frontend development",
        "description": "Enter a whole number.",
        "required": True,
        "options": [],
    },
    {
        "type": "dropdown",
        "title": "Which best describes your primary tech stack?",
        "description": "",
        "required": True,
        "options": [
            {"id": "s1", "label": "React / Next.js"},
            {"id": "s2", "label": "Vue / Nuxt"},
            {"id": "s3", "label": "Angular"},
            {"id": "s4", "label": "Svelte / SvelteKit"},
            {"id": "s5", "label": "Other"},
        ],
    },
    {
        "type": "yes_no",
        "title": "Are you open to fully remote work?",
        "description": "",
        "required": True,
        "options": [],
    },
    {
        "type": "rating",
        "title": "How would you rate your TypeScript proficiency?",
        "description": "1 = Beginner, 5 = Expert",
        "required": True,
        "options": {"max": 5},
    },
    {
        "type": "long_text",
        "title": "Briefly describe a challenging project you've worked on",
        "description": "Focus on the technical decisions and trade-offs.",
        "required": False,
        "options": [],
    },
    {
        "type": "short_text",
        "title": "Link to your portfolio or GitHub profile",
        "description": "Optional but encouraged.",
        "required": False,
        "options": [],
    },
]

DRAFT_QUESTIONS = [
    {
        "type": "short_text",
        "title": "What is your primary use case?",
        "description": "",
        "required": True,
        "options": [],
    },
    {
        "type": "multiple_choice",
        "title": "How did you hear about us?",
        "description": "",
        "required": False,
        "options": [
            {"id": "h1", "label": "Search engine"},
            {"id": "h2", "label": "Social media"},
            {"id": "h3", "label": "Word of mouth"},
            {"id": "h4", "label": "Other"},
        ],
    },
]

CUSTOMER_FEEDBACK_ANSWERS = [
    # name, email, rating, product, yes_no, team_size, feedback
    ("Alice Johnson", "alice@example.com", 5, "p2", "yes", 12, "Absolutely love the product!"),
    ("Bob Smith", "bob@example.com", 4, "p1", "yes", 3, "Great but onboarding could be smoother."),
    ("Carol White", "carol@corp.io", 5, "p3", "yes", 200, "Enterprise support is top-notch."),
    ("David Lee", "david@startup.co", 3, "p2", "no", 8, "Missing some key integrations we need."),
    ("Eva Martinez", "eva@agency.dev", 4, "p1", "yes", 2, "Value for money is excellent."),
    ("Frank Chen", "frank@bigco.com", 5, "p3", "yes", 450, "Scales beautifully."),
    ("Grace Kim", "grace@freelance.me", 2, "p1", "no", 1, "Support response times were too slow."),
    ("Henry Brown", "henry@lab.ai", 4, "p2", "yes", 15, "Docs could be more comprehensive."),
]

JOB_APP_ANSWERS = [
    # name, email, years, stack, remote, ts_rating, project_desc, portfolio
    ("Sophia Turner", "sophia@dev.io", 6, "s1", "yes", 5, "Rebuilt a real-time dashboard serving 50k DAU using React + WebSockets, cutting p99 latency by 40%.", "https://github.com/sophiat"),
    ("Liam Garcia", "liam@code.co", 3, "s1", "yes", 4, "Led migration of a legacy jQuery app to Next.js App Router, reducing bundle size by 60%.", "https://liamgarcia.dev"),
    ("Mia Patel", "mia@frontend.dev", 8, "s2", "no", 3, "Designed a Nuxt-based microfrontend architecture for a fintech SaaS platform.", "https://miapatel.io"),
    ("Noah Kim", "noah@web.dev", 2, "s1", "yes", 4, "Built a drag-and-drop form builder in React with complex state management.", "https://github.com/noahkim"),
    ("Olivia Chen", "olivia@ux.io", 5, "s3", "yes", 5, "Architected an Angular PWA for a healthcare portal with offline-first data sync.", ""),
    ("James Wilson", "james@fullstack.dev", 4, "s4", "yes", 3, "Migrated a Vue 2 app to SvelteKit, improving Core Web Vitals significantly.", "https://jameswilson.codes"),
]


class Command(BaseCommand):
    help = "Seed the database with sample forms, questions, and responses."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # ── User ──────────────────────────────────────────────────────────────
        user, created = User.objects.get_or_create(
            username="creator",
            defaults={"email": "creator@example.com", "first_name": "Form", "last_name": "Creator"},
        )
        if created:
            user.set_password("creator123")
            user.save()
            self.stdout.write(self.style.SUCCESS("  Created user: creator / creator123"))
        else:
            self.stdout.write("  User 'creator' already exists, skipping.")

        # ── Form 1: Customer Feedback Survey ─────────────────────────────────
        form1, _ = self._get_or_create_form(
            user=user,
            title="Customer Feedback Survey",
            description="Help us improve by sharing your experience.",
            status="published",
            welcome_screen={
                "title": "We'd love your feedback!",
                "description": "This survey takes about 2 minutes. Your answers help us build a better product.",
                "button_text": "Start Survey",
            },
            thankyou_screen={
                "title": "Thank you so much!",
                "description": "Your feedback has been recorded. We'll use it to keep improving.",
            },
            theme={"accent_color": "#6366f1", "background": "#f8f7ff"},
        )
        self._seed_questions(form1, CUSTOMER_FEEDBACK_QUESTIONS)
        self._seed_responses_customer_feedback(form1, CUSTOMER_FEEDBACK_ANSWERS)
        self.stdout.write(self.style.SUCCESS(f"  Created form: {form1.title} (published, slug: {form1.public_slug})"))

        # ── Form 2: Job Application ───────────────────────────────────────────
        form2, _ = self._get_or_create_form(
            user=user,
            title="Job Application — Frontend Engineer",
            description="Apply to join our product team as a frontend engineer.",
            status="published",
            welcome_screen={
                "title": "Excited you're applying!",
                "description": "This takes about 5 minutes. We review every application personally.",
                "button_text": "Begin Application",
            },
            thankyou_screen={
                "title": "Application received!",
                "description": "We'll be in touch within 5 business days.",
            },
            theme={"accent_color": "#10b981", "background": "#f0fdf4"},
        )
        self._seed_questions(form2, JOB_APPLICATION_QUESTIONS)
        self._seed_responses_job_app(form2, JOB_APP_ANSWERS)
        self.stdout.write(self.style.SUCCESS(f"  Created form: {form2.title} (published, slug: {form2.public_slug})"))

        # ── Form 3: Draft ─────────────────────────────────────────────────────
        form3, _ = self._get_or_create_form(
            user=user,
            title="Product Onboarding Survey",
            description="Understanding how new users discover their aha-moment.",
            status="draft",
        )
        self._seed_questions(form3, DRAFT_QUESTIONS)
        self.stdout.write(self.style.SUCCESS(f"  Created form: {form3.title} (draft)"))

        self.stdout.write(self.style.SUCCESS("\nSeeding complete!"))
        self.stdout.write(f"  Visit http://localhost:8000/admin/ for data browser")
        self.stdout.write(f"  Form 1 public URL: /f/{form1.public_slug}")
        self.stdout.write(f"  Form 2 public URL: /f/{form2.public_slug}")

    def _get_or_create_form(self, user, title, description, status, welcome_screen=None, thankyou_screen=None, theme=None):
        existing = Form.objects.filter(title=title, owner=user).first()
        if existing:
            return existing, False

        slug = None
        if status == "published":
            base = slugify(title)
            slug = f"{base}-{uuid.uuid4().hex[:6]}"

        form = Form.objects.create(
            owner=user,
            title=title,
            description=description,
            status=status,
            public_slug=slug,
            welcome_screen=welcome_screen or {},
            thankyou_screen=thankyou_screen or {},
            theme=theme or {},
        )
        return form, True

    def _seed_questions(self, form, question_defs):
        if form.questions.exists():
            return
        # Every question requires a Page (added in migration 0005)
        page, _ = Page.objects.get_or_create(form=form, order_index=0)
        for idx, qdef in enumerate(question_defs):
            Question.objects.create(
                form=form,
                page=page,
                type=qdef["type"],
                title=qdef["title"],
                description=qdef.get("description", ""),
                order_index=idx,
                order_in_page=idx,
                required=qdef.get("required", False),
                options=qdef.get("options", []),
            )

    def _seed_responses_customer_feedback(self, form, answer_rows):
        if form.responses.exists():
            return
        questions = list(form.questions.order_by("order_index"))

        for i, row in enumerate(answer_rows):
            name, email, rating, product_id, yes_no, team_size, feedback = row
            # Last two are partial
            is_completed = i < len(answer_rows) - 2
            resp = Response.objects.create(
                form=form,
                status="completed" if is_completed else "partial",
                completed_at=timezone.now() if is_completed else None,
                respondent_meta={"user_agent": "SeedScript/1.0"},
            )

            # Map answers to question order: name, email, rating, product, yes_no, team_size, feedback
            answer_values = [
                name,
                email,
                rating,
                {"selected_option_id": product_id},
                yes_no,
                team_size,
                feedback,
            ]

            for q, val in zip(questions, answer_values):
                if not is_completed and q.type == "long_text":
                    continue  # partial responses skip the last question
                Answer.objects.create(response=resp, question=q, value=val)

    def _seed_responses_job_app(self, form, answer_rows):
        if form.responses.exists():
            return
        questions = list(form.questions.order_by("order_index"))

        for i, row in enumerate(answer_rows):
            name, email, years, stack_id, remote, ts_rating, project_desc, portfolio = row
            is_completed = i < len(answer_rows) - 1
            resp = Response.objects.create(
                form=form,
                status="completed" if is_completed else "partial",
                completed_at=timezone.now() if is_completed else None,
                respondent_meta={"user_agent": "SeedScript/1.0"},
            )

            answer_values = [
                name,
                email,
                years,
                {"selected_option_id": stack_id},
                remote,
                ts_rating,
                project_desc,
                portfolio,
            ]

            for q, val in zip(questions, answer_values):
                if not is_completed and q.type in ("long_text", "short_text") and q.order_index >= 6:
                    continue
                if val == "":
                    continue
                Answer.objects.create(response=resp, question=q, value=val)
