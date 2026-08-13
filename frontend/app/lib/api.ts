/**
 * Typed API client — ALL backend calls go through this module.
 * Base URL is read from NEXT_PUBLIC_API_BASE env var.
 */

import type {
  Answer,
  Form,
  FormListItem,
  FormSummary,
  PaginatedResponse,
  Question,
  ResponseDetail,
  ResponseListItem,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = await res.text();
    }
    throw { status: res.status, body: errorBody };
  }

  // 204 No Content → return null
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

async function requestFormData<T>(
  path: string,
  formData: FormData,
  method = 'POST'
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    body: formData,
    // Don't set Content-Type header — let browser set multipart boundary
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = await res.text();
    }
    throw { status: res.status, body: errorBody };
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ─── Creator: Forms ───────────────────────────────────────────────────────────

export const api = {
  forms: {
    list(): Promise<PaginatedResponse<FormListItem>> {
      return request('/api/forms/');
    },

    create(data: { title: string }): Promise<Form> {
      return request('/api/forms/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    get(id: number): Promise<Form> {
      return request(`/api/forms/${id}/`);
    },

    patch(id: number, data: Partial<Form>): Promise<Form> {
      return request(`/api/forms/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete(id: number): Promise<null> {
      return request(`/api/forms/${id}/`, { method: 'DELETE' });
    },

    duplicate(id: number): Promise<Form> {
      return request(`/api/forms/${id}/duplicate/`, { method: 'POST' });
    },

    publish(id: number): Promise<Form> {
      return request(`/api/forms/${id}/publish/`, { method: 'POST' });
    },

    unpublish(id: number): Promise<Form> {
      return request(`/api/forms/${id}/unpublish/`, { method: 'POST' });
    },
  },

  // ─── Creator: Questions ─────────────────────────────────────────────────────

  questions: {
    create(formId: number, data: Partial<Question>): Promise<Question> {
      return request(`/api/forms/${formId}/questions/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    patch(id: number, data: Partial<Question>): Promise<Question> {
      return request(`/api/questions/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete(id: number): Promise<null> {
      return request(`/api/questions/${id}/`, { method: 'DELETE' });
    },

    reorder(
      formId: number,
      items: Array<{ id: number; order_index: number }>
    ): Promise<{ status: string }> {
      return request(`/api/forms/${formId}/questions/reorder/`, {
        method: 'POST',
        body: JSON.stringify(items),
      });
    },
  },

  // ─── Creator: Responses & Summary ──────────────────────────────────────────

  responses: {
    list(formId: number): Promise<PaginatedResponse<ResponseListItem>> {
      return request(`/api/forms/${formId}/responses/`);
    },

    get(id: number): Promise<ResponseDetail> {
      return request(`/api/responses/${id}/`);
    },

    exportUrl(formId: number): string {
      return `${BASE}/api/forms/${formId}/responses/export/`;
    },
  },

  summary: {
    get(formId: number): Promise<FormSummary> {
      return request(`/api/forms/${formId}/summary/`);
    },
  },

  // ─── Public: Respondent flow ─────────────────────────────────────────────

  public: {
    getForm(slug: string): Promise<Form> {
      return request(`/api/public/forms/${slug}/`);
    },

    start(slug: string): Promise<{ response_id: number }> {
      return request(`/api/public/forms/${slug}/start/`, { method: 'POST' });
    },

    answer(
      responseId: number,
      questionId: number,
      value: unknown,
      file?: File
    ): Promise<Answer> {
      if (file) {
        const fd = new FormData();
        fd.append('question_id', String(questionId));
        fd.append('value', JSON.stringify(value));
        fd.append('file', file);
        return requestFormData(`/api/public/responses/${responseId}/answer/`, fd);
      }
      return request(`/api/public/responses/${responseId}/answer/`, {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, value }),
      });
    },

    submit(
      responseId: number
    ): Promise<{ status: string; response_id: number }> {
      return request(`/api/public/responses/${responseId}/submit/`, {
        method: 'POST',
      });
    },
  },
};
