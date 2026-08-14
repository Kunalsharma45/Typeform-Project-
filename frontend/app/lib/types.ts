// ── Shared TypeScript types matching DRF serializer output shapes ──────────

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating'
  | 'file_upload';

export interface QuestionOption {
  id: string;
  label: string;
}

// ── Logic / Branching types ───────────────────────────────────────────────

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_answered'
  | 'is_empty';

export interface LogicRule {
  id: string;
  condition: {
    operator: LogicOperator;
    value?: string | number;
  };
  target_question_id: number | null;
  target_is_ending: boolean;
}

export interface LogicMapQuestion {
  id: number;
  order_index: number;
  type: QuestionType;
  title: string;
  options?: QuestionOption[];
  logic_rules: LogicRule[];
  default_next_question_id: number | null;
  default_next_is_ending: boolean;
}

export interface LogicMapResponse {
  form_id: number;
  questions: LogicMapQuestion[];
  endings: { id: string; label: string }[];
}

// Legacy single-rule branching (kept for backward compat in respondent flow)
export interface QuestionLogic {
  if_option_id: string;
  goto_question_id: number;
}

export interface Question {
  id: number;
  form: number;
  type: QuestionType;
  title: string;
  description: string;
  order_index: number;
  required: boolean;
  options: QuestionOption[] | { max: number } | [];
  logic: QuestionLogic | null;
  logic_rules: LogicRule[];
  default_next_question_id: number | null;
  default_next_is_ending: boolean;
  created_at: string;
  updated_at: string;
}

export interface WelcomeScreen {
  title?: string;
  description?: string;
  button_text?: string;
  time_to_complete?: boolean;
  show_submission_count?: boolean;
}

export interface ThankYouScreen {
  title?: string;
  description?: string;
}

export interface FormTheme {
  accent_color?: string;
  background?: string;
  font?: string;
}

export type FormStatus = 'draft' | 'published';

export interface Form {
  id: number;
  title: string;
  description: string;
  status: FormStatus;
  public_slug: string | null;
  theme: FormTheme;
  welcome_screen: WelcomeScreen;
  thankyou_screen: ThankYouScreen;
  questions: Question[];
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormListItem {
  id: number;
  title: string;
  description: string;
  status: FormStatus;
  public_slug: string | null;
  theme: FormTheme;
  response_count: number;
  completed_count?: number;
  created_at: string;
  updated_at: string;
}

export type ResponseStatus = 'partial' | 'completed';

export interface Answer {
  id: number;
  response: number;
  question: number;
  question_title: string;
  question_type: QuestionType;
  value: unknown;
  file: string | null;
  file_url: string | null;
  created_at: string;
}

export interface ResponseListItem {
  id: number;
  form: number;
  status: ResponseStatus;
  started_at: string;
  completed_at: string | null;
  respondent_meta: Record<string, unknown>;
  answer_count: number;
}

export interface ResponseDetail {
  id: number;
  form: number;
  status: ResponseStatus;
  started_at: string;
  completed_at: string | null;
  respondent_meta: Record<string, unknown>;
  answers: Answer[];
}

export interface QuestionSummary {
  question_id: number;
  question_title: string;
  question_type: QuestionType;
  data: Array<{ label: string; count: number } | string>;
  total_answers: number;
}

export interface FormSummary {
  form_id: number;
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  questions: QuestionSummary[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
