# Typeform Clone

A highly functional Typeform clone built for the SDE Fullstack Assignment, featuring a beautiful drag-and-drop form builder, dynamic logic branching, and a seamless one-question-at-a-time respondent flow.

## 2. Live Demo & Repo Links

- **Frontend URL:** `[Deployment pending]` (Configured for Vercel, waiting for live deployment)
- **Backend API:** `[Deployment pending]` (Configured for Render, used internally by the frontend)

## 3. Tech Stack

**Frontend:**
- Next.js 16.3.0 (App Router)
- React 19.2.8, TypeScript
- Tailwind CSS v4
- Framer Motion 13.1.0 (for smooth transitions)
- @dnd-kit/core & @dnd-kit/sortable (for drag-and-drop reordering)
- Recharts 3.10.1 (for results analytics)
- lucide-react 1.31.0 (for icons)
- react-hot-toast 2.6.0 (for notifications)

**Backend:**
- Django 6.1
- Django REST Framework 3.18.0
- django-cors-headers 4.9.0
- gunicorn 23.0.0 & whitenoise 6.8.2 (for deployment)

**Database:**
- SQLite (via Django ORM)

## 4. Setup Instructions

```bash
# Backend
cd backend/myproject
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

```bash
# Frontend (separate terminal)
cd frontend
npm install
# Create .env.local with the following line:
# NEXT_PUBLIC_API_BASE=http://localhost:8000
npm run dev
```

- **Default Ports:** Backend API runs on `8000`, Frontend runs on `3000`.
- **Seeded Data:** Running `python manage.py seed` populates the database with 2 published forms, 1 draft form, and a set of sample responses. This command can be safely re-run to reset to the original sample data. 
- **Creator Authentication:** A default creator user is automatically seeded. No login is required.

## 5. Architecture Overview

The application is structured as a decoupled fullstack monolith:
- A Next.js frontend handles routing, state, and UI.
- A Django REST Framework backend serves as the single source of truth over a REST API.
- All requests between them are routed through a centralized API client (`frontend/app/lib/api.ts`).

There are two primary distinct frontend experiences that share the same backend data models:
1. **The Creator Side:** The authenticated-by-default builder experience (Dashboard, Form Builder, Logic Map, Results). Creator authentication is intentionally simplified per the assignment requirements (a single default creator is used, and no login/registration UI exists).
2. **The Public Respondent Side:** The `/f/[publicSlug]` route. This is accessible without authentication (`AllowAny` permission) and serves the form fill experience.

A shared `QuestionRenderer` component pattern is used to render the exact same question UI inside the builder's live preview and the actual respondent flow, parameterized by an active "mode" to handle interactions differently depending on context.

## 6. Database Schema

| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **Form** | `status`, `public_slug`, `theme`, `welcome_screen`, `thankyou_screen` | `owner` → `User` (FK, Cascade) |
| **Question** | `type`, `order_index`, `required`, `options`, `logic_rules`, `default_next_question_id`, `default_next_is_ending` | `form` → `Form` (FK, Cascade) |
| **Response** | `status` (partial/completed), `started_at`, `completed_at`, `respondent_meta` | `form` → `Form` (FK, Cascade) |
| **Answer** | `value`, `file` | `response` → `Response` (FK, Cascade)<br>`question` → `Question` (FK, Cascade) |

- **Relationships are strictly enforced** via `on_delete=models.CASCADE`.
- **Unique Constraint:** The `Answer` model enforces a `unique_together = ("response", "question")` constraint, ensuring one answer per question per response. This allows for safe upsert-style autosaving.

## 7. API Overview

**Creator-side**
```text
GET/POST          /api/forms/                               List / create forms
GET/PATCH/DELETE  /api/forms/<id>/                          Retrieve / update / delete a form
POST              /api/forms/<id>/duplicate/                Duplicate a form
POST              /api/forms/<id>/publish/                  Publish (generates public_slug)
POST              /api/forms/<id>/unpublish/                Unpublish
GET/POST          /api/forms/<form_id>/questions/           List / create questions
GET/PATCH/DELETE  /api/questions/<id>/                      Retrieve / update / delete a question
POST              /api/forms/<form_id>/questions/reorder/   Reorder questions
GET               /api/forms/<form_id>/responses/           List form responses
GET               /api/forms/<form_id>/responses/export/    Export responses as CSV
GET               /api/forms/<form_id>/summary/             Get form analytics summary
GET               /api/responses/<id>/                      Retrieve single response
GET               /api/forms/<form_id>/logic-map/           Fetch branch logic map
PATCH             /api/questions/<id>/logic/                Update logic branching rules
DELETE            /api/questions/<id>/logic/<rule_id>/      Delete a logic branching rule
```

**Public (no auth)**
```text
GET               /api/public/forms/<slug>/                 Fetch a published form
POST              /api/public/forms/<slug>/start/           Start a response session
POST              /api/public/responses/<id>/answer/        Autosave an answer
POST              /api/public/responses/<id>/submit/        Validate + finalize submission
```

## 8. Features Implemented

**Core (Assignment "Must Have")**
- [x] **Form Builder:** Add, edit, delete, and drag-and-drop reorder questions.
- [x] **Question Types:** Short text, long text, multiple choice, dropdown, email, number, yes/no, rating, and file upload.
- [x] **Live Preview:** Builder layout features a 1-to-1 live preview.
- [x] **Form CRUD:** Create, duplicate, rename, delete, and list forms.
- [x] **Publish/Unpublish:** Generates a secure shareable public link.
- [x] **Respondent Flow:** One-question-at-a-time, smooth transitions, keyboard navigation (Enter to advance).
- [x] **Validation:** Both client-side (regex/type checks) and server-side validation independently enforced.
- [x] **Submission:** Stores responses to DB and displays a customizable thank-you screen.
- [x] **Results:** Per-form responses view table, individual response inspection, and summary stats.

**Bonus Features Implemented**
- [x] **Logic Jumps / Conditional Branching:** Fully functional logic maps allowing users to conditionally route respondents.
- [x] **CSV Export:** Responses can be exported as a CSV.
- [x] **Partial-Response Tracking / Completion Rate:** The backend natively handles "partial" status autosaving before completion.
- [x] **Custom Themes:** Themes are supported natively in the database and applied in the builder UI.
- [x] **File-Upload Question Type:** Fully supported via `models.FileField`.

**Bonus Features Not Implemented**
- [ ] Dark Mode (omitted in favor of focusing on core Typeform aesthetic).

**Placeholder / "Coming Soon" Sections**
- Connect / Integrations, Workflow automations, Team collaboration, View plans/pricing, and AI-suggestions are intentionally stubbed with visual placeholders as permitted by the assignment to complete the aesthetic.

## 9. Assumptions Made

- **Single Default Creator:** No authentication/login/registration flow was built. A single default creator is assumed and seeded per the assignment's explicit allowances.
- **Django Admin Panel Removed:** The Django admin panel (`/admin/`) was intentionally removed and not exposed in `urls.py` since it is a direct explicit non-requirement.
- **Logic Branching Model:** Single-condition logic jumps are supported via sequential evaluation (first rule to evaluate as true routes the user, falling back to a default next question).
- **Public Upload Sizes:** File uploads are limited by default Django/Next.js request sizes, no strict custom MB limit was added as a soft requirement.

## 10. Known Limitations
- The "Universal Mode" dropdown in the top bar is cosmetic only.
- The results view "completion rate" metric is natively tracked by the backend (`completed_count` vs `response_count`) but isn't explicitly charted in a dedicated visual widget on the frontend UI yet.
