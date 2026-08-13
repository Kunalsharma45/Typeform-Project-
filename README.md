# Typeform Clone — Fullstack Assignment

A functional [Typeform](https://www.typeform.com) clone built as a fullstack SDE assignment. Features a beautiful form builder with drag-and-drop, a one-question-at-a-time respondent flow with Framer Motion transitions, and a results analytics dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.3 (App Router, TypeScript, Tailwind CSS v4) |
| Backend | Django 6.1 + Django REST Framework 3.18 |
| Database | SQLite (via Django ORM) |
| CORS | django-cors-headers 4.9 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Animations | Framer Motion |
| Charts | Recharts |
| Toasts | react-hot-toast |
| Fonts | Inter + DM Serif Display (via next/font/google) |

---

## Setup Instructions

### Prerequisites
- Python 3.13 with `venv`
- Node.js 18+ with npm

### Backend

```bash
# From repo root
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
cd myproject
python manage.py migrate

# Seed sample data (creates 2 published forms + 1 draft + responses)
python manage.py seed

# Start development server (port 8000)
python manage.py runserver
```

**Admin panel**: http://localhost:8000/admin/
- Create a superuser first: `python manage.py createsuperuser`

### Frontend

```bash
# From repo root
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local

# Start development server (port 3000)
npm run dev
```

Open http://localhost:3000 — it redirects to `/dashboard`.

### Default Ports
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### Default Seed Data Credentials
- **Creator username**: `creator`
- **Creator password**: `creator123`
- **Form 1 (published)**: Customer Feedback Survey
- **Form 2 (published)**: Job Application — Frontend Engineer
- **Form 3 (draft)**: Product Onboarding Survey

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js 16)                  │
│  /dashboard  /forms/:id/edit  /forms/:id/results  /f/:slug │
│                                                          │
│  app/lib/api.ts ── all API calls centralized here       │
│  app/lib/types.ts ── TypeScript interfaces               │
│  app/components/QuestionRenderer.tsx ── shared component │
│         (used in both builder preview + respondent flow) │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (CORS-enabled)
                       │ http://localhost:8000/api/
┌──────────────────────▼──────────────────────────────────┐
│                   Django 6.1 + DRF                       │
│  forms/                                                  │
│  ├── models.py      (Form, Question, Response, Answer)   │
│  ├── serializers.py (FormList, FormDetail, Question, ...) │
│  ├── views.py       (creator + public APIViews)          │
│  ├── urls.py        (all route mappings)                 │
│  └── management/commands/seed.py                        │
│                           │                              │
│                    SQLite (db.sqlite3)                   │
└─────────────────────────────────────────────────────────┘
```

**Communication**: The Next.js frontend calls the Django API exclusively through `app/lib/api.ts`. CORS is configured to allow `http://localhost:3000`. No server-side rendering of data — all pages are Client Components that fetch on mount.

---

## Database Schema

### Tables & Relationships

```
auth_user (Django built-in)
  └── forms_form (owner → User)
        └── forms_question (form → Form)
        └── forms_response (form → Form)
              └── forms_answer (response → Response, question → Question)
```

### forms_form
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| owner_id | FK → auth_user | |
| title | VARCHAR(255) | |
| description | TEXT | |
| status | VARCHAR(10) | `draft` / `published` |
| public_slug | SLUG (unique) | Set on publish |
| theme | JSON | `{accent_color, background}` |
| welcome_screen | JSON | `{title, description, button_text}` |
| thankyou_screen | JSON | `{title, description}` |
| created_at / updated_at | DATETIME | |

### forms_question
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| form_id | FK → forms_form | Cascade delete |
| type | VARCHAR(20) | One of 9 types (see below) |
| title | VARCHAR(500) | |
| description | VARCHAR(500) | Help text |
| order_index | INTEGER | Used for ordering |
| required | BOOLEAN | |
| options | JSON | `[{id, label}]` for choice types; `{max: N}` for rating |
| logic | JSON | `{if_option_id, goto_question_id}` for branching |

**Question types**: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`, `file_upload`

### forms_response
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| form_id | FK → forms_form | |
| status | VARCHAR(10) | `partial` / `completed` |
| started_at | DATETIME | auto_now_add |
| completed_at | DATETIME | Set on submit |
| respondent_meta | JSON | `{user_agent}` |

### forms_answer
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| response_id | FK → forms_response | |
| question_id | FK → forms_question | |
| value | JSON | String / number / boolean / `{selected_option_id}` |
| file | FileField | Only for `file_upload` questions |
| created_at | DATETIME | |
| UNIQUE | (response_id, question_id) | Enables upsert autosave |

---

## API Overview

Base path: `/api/`

### Creator — Forms
```
GET    /api/forms/                        List all forms (paginated)
POST   /api/forms/                        Create new draft form
GET    /api/forms/{id}/                   Get form with questions
PATCH  /api/forms/{id}/                   Update form fields
DELETE /api/forms/{id}/                   Delete form (cascades)
POST   /api/forms/{id}/duplicate/         Deep-copy form + questions
POST   /api/forms/{id}/publish/           Set status=published, generate slug
POST   /api/forms/{id}/unpublish/         Set status=draft
```

### Creator — Questions
```
POST   /api/forms/{id}/questions/         Add question (appends to end)
PATCH  /api/questions/{id}/               Edit question
DELETE /api/questions/{id}/               Delete question
POST   /api/forms/{id}/questions/reorder/ Bulk reorder [{id, order_index}]
```

### Creator — Responses & Analytics
```
GET    /api/forms/{id}/responses/         List responses (paginated)
GET    /api/responses/{id}/               Full response with answers
GET    /api/forms/{id}/summary/           Per-question aggregates + completion rate
GET    /api/forms/{id}/responses/export/  CSV download
```

### Public — Respondent Flow (AllowAny)
```
GET    /api/public/forms/{slug}/                 Get published form + questions
POST   /api/public/forms/{slug}/start/           Create partial response → {response_id}
POST   /api/public/responses/{id}/answer/        Upsert answer (autosave per question)
POST   /api/public/responses/{id}/submit/        Validate required fields → mark completed
```

---

## Assumptions

1. **Single creator**: No login flow. All creator-side API endpoints use a single default user (`creator`). The `Form.owner` FK is modelled correctly for extensibility.
2. **No real auth**: `DEFAULT_PERMISSION_CLASSES = [AllowAny]` is the global DRF default. Public endpoints additionally set `permission_classes = [AllowAny]` explicitly on the view for clarity.
3. **SQLite**: Used as-is per assignment spec. No changes to the database engine.
4. **CORS**: Configured for `http://localhost:3000` only. Update `CORS_ALLOWED_ORIGINS` for production.
5. **Media files**: `MEDIA_ROOT = backend/myproject/media/`. File uploads work in development; production would need cloud storage (S3, etc.).

## Implemented Bonus Features

| Feature | Status |
|---|---|
| Branching / logic jumps | ✅ Builder UI + respondent-flow evaluation |
| CSV export | ✅ `/api/forms/{id}/responses/export/` |
| Completion rate display | ✅ Shown on Results page header |
| Custom theme (accent + background) | ✅ Form Settings modal + applied on public form |
| File upload question type | ✅ Modelled, backend accepts multipart, QuestionRenderer has UI |
| Dark mode | ❌ Not implemented (deferred as last bonus) |
