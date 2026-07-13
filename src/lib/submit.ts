import { CANDIDATE_NAME_ID, CANDIDATE_PHONE_ID, questions } from '../questions';
import { findCountry, formatInternational } from '../countries';
import type { AnswersMap, AnswerValue, PhoneValue, ReferencesMap } from './storage';

export type Delivery = 'sent' | 'downloaded';

export type SubmissionPayload = {
  candidate: { name: string; phone: string };
  startedAt: string;
  submittedAt: string;
  timeUsedSeconds: number;
  autoSubmitted: boolean;
  answers: { id: string; title: string; answer: string; references: string[] }[];
};

export type FeedbackPayload = {
  type: 'feedback';
  candidate: { name: string; phone: string };
  difficulty: number; // 1–5
  difficultyLabel: string;
  comment: string;
  submittedAt: string;
};

function isPhoneValue(value: AnswerValue | undefined): value is PhoneValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function answerText(value: AnswerValue | undefined): string {
  if (isPhoneValue(value)) {
    if (!value.number.trim()) return '';
    return formatInternational(findCountry(value.country), value.number);
  }
  if (Array.isArray(value)) return value.join(', ');
  return (value ?? '').trim();
}

export function cleanReferences(links: string[] | undefined): string[] {
  return (links ?? []).map((l) => l.trim()).filter((l) => l !== '');
}

export function buildPayload(
  answers: AnswersMap,
  references: ReferencesMap,
  startedAtMs: number,
  submittedAtMs: number,
  timeUsedSeconds: number,
  autoSubmitted: boolean,
): SubmissionPayload {
  return {
    candidate: {
      name: answerText(answers[CANDIDATE_NAME_ID]),
      phone: answerText(answers[CANDIDATE_PHONE_ID]),
    },
    startedAt: new Date(startedAtMs).toISOString(),
    submittedAt: new Date(submittedAtMs).toISOString(),
    timeUsedSeconds,
    autoSubmitted,
    answers: questions.map((q) => ({
      id: q.id,
      title: q.title,
      answer: answerText(answers[q.id]),
      references: q.allowReferences ? cleanReferences(references[q.id]) : [],
    })),
  };
}

export async function deliver(
  payload: SubmissionPayload | FeedbackPayload,
  filePrefix: string,
  stampIso: string,
): Promise<Delivery> {
  const url = import.meta.env.VITE_SUBMIT_URL;
  if (typeof url === 'string' && url.trim() !== '') {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return 'sent';
    } catch {
      // rrjeti dështoi — kalojmë te shkarkimi lokal
    }
  }
  downloadJson(payload, `${filePrefix}-${stampIso.replace(/[:.]/g, '-')}.json`);
  return 'downloaded';
}

function downloadJson(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
