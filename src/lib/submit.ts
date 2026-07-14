import emailjs from '@emailjs/browser';
import { CANDIDATE_NAME_ID, CANDIDATE_PHONE_ID, questions } from '../questions';
import { findCountry, formatInternational } from '../countries';
import { formatTime } from './time';
import type { AnswersMap, AnswerValue, PhoneValue, ReferencesMap } from './storage';

// Marrësit e testeve dhe të vlerësimeve — të ndarë me presje; shabloni i
// EmailJS duhet ta ketë fushën "To Email" = {{to_email}}
export const RECIPIENT_EMAILS = 'info@keqyr.com, ulpian.morina@keqyr.com';

export type SubmissionPayload = {
  candidate: { name: string; phone: string };
  startedAt: string;
  submittedAt: string;
  timeUsedSeconds: number;
  autoSubmitted: boolean;
  answers: { id: string; title: string; answer: string; references: string[] }[];
};

export type FeedbackPayload = {
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

function formatSubmissionBody(p: SubmissionPayload): string {
  const lines = [
    'TESTI: Kontabilist i Brendshëm',
    '',
    `Kandidati: ${p.candidate.name || '(pa emër)'}`,
    `Telefoni: ${p.candidate.phone || '(pa numër)'}`,
    '',
    `Filloi: ${p.startedAt}`,
    `Dërguar: ${p.submittedAt}`,
    `Koha e përdorur: ${formatTime(p.timeUsedSeconds)}`,
    `Dërgim automatik (koha skadoi): ${p.autoSubmitted ? 'Po' : 'Jo'}`,
    '',
    '================ PËRGJIGJET ================',
  ];
  p.answers.forEach((a, i) => {
    lines.push('', `${i + 1}. ${a.title}`, '', a.answer || '(pa përgjigje)');
    if (a.references.length > 0) {
      lines.push(`Referencat: ${a.references.join(' | ')}`);
    }
  });
  return lines.join('\n');
}

function formatFeedbackBody(p: FeedbackPayload): string {
  return [
    'VLERËSIMI I VËSHTIRËSISË SË TESTIT',
    '',
    `Kandidati: ${p.candidate.name || '(pa emër)'}`,
    `Telefoni: ${p.candidate.phone || '(pa numër)'}`,
    '',
    `Vështirësia: ${p.difficulty}/5 — ${p.difficultyLabel}`,
    `Komenti: ${p.comment || '(pa koment)'}`,
    `Dërguar: ${p.submittedAt}`,
  ].join('\n');
}

function emailConfig() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return null;
  return { serviceId, templateId, publicKey };
}

// Dy përpjekje të heshtura; dështimi regjistrohet vetëm në console —
// kandidatit nuk i shfaqet asnjë gabim.
async function sendEmail(subject: string, body: string, candidateName: string): Promise<boolean> {
  const config = emailConfig();
  if (!config) {
    console.error('EmailJS nuk është konfiguruar (VITE_EMAILJS_*) — email-i nuk u dërgua.');
    return false;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          to_email: RECIPIENT_EMAILS,
          subject,
          body,
          candidate_name: candidateName,
        },
        { publicKey: config.publicKey },
      );
      return true;
    } catch (error) {
      if (attempt === 2) {
        console.error('Dërgimi i email-it dështoi pas dy përpjekjeve:', error);
      }
    }
  }
  return false;
}

export function sendSubmissionEmail(payload: SubmissionPayload): Promise<boolean> {
  return sendEmail(
    `Test i ri — ${payload.candidate.name || 'Kandidat pa emër'} (Kontabilist i Brendshëm)`,
    formatSubmissionBody(payload),
    payload.candidate.name,
  );
}

export function sendFeedbackEmail(payload: FeedbackPayload): Promise<boolean> {
  return sendEmail(
    `Vlerësim vështirësie — ${payload.candidate.name || 'Kandidat pa emër'} (Kontabilist i Brendshëm)`,
    formatFeedbackBody(payload),
    payload.candidate.name,
  );
}
