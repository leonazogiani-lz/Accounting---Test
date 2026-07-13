export type PhoneValue = { country: string; number: string };
export type AnswerValue = string | string[] | PhoneValue;
export type AnswersMap = Record<string, AnswerValue>;
export type ReferencesMap = Record<string, string[]>;

export type StoredSession = {
  startedAt: string;
  answers: AnswersMap;
  references: ReferencesMap;
  step: number;
};

const KEY_STARTED_AT = 'kontabilist-test.startedAt';
const KEY_ANSWERS = 'kontabilist-test.answers';
const KEY_REFERENCES = 'kontabilist-test.references';
const KEY_STEP = 'kontabilist-test.step';

export function loadSession(): StoredSession | null {
  try {
    const startedAt = localStorage.getItem(KEY_STARTED_AT);
    if (!startedAt || Number.isNaN(Date.parse(startedAt))) return null;

    const step = Number(localStorage.getItem(KEY_STEP) ?? '0');
    return {
      startedAt,
      answers: readRecord<AnswersMap>(KEY_ANSWERS),
      references: readRecord<ReferencesMap>(KEY_REFERENCES),
      step: Number.isFinite(step) ? step : 0,
    };
  } catch {
    return null;
  }
}

function readRecord<T extends Record<string, unknown>>(key: string): T {
  const raw = localStorage.getItem(key);
  if (raw) {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T;
  }
  return {} as T;
}

export function saveStartedAt(iso: string): void {
  try {
    localStorage.setItem(KEY_STARTED_AT, iso);
  } catch {
    // localStorage i padisponueshëm (p.sh. modaliteti privat) — testi vazhdon pa persistencë
  }
}

export function saveAnswers(answers: AnswersMap): void {
  try {
    localStorage.setItem(KEY_ANSWERS, JSON.stringify(answers));
  } catch {
    // shih saveStartedAt
  }
}

export function saveReferences(references: ReferencesMap): void {
  try {
    localStorage.setItem(KEY_REFERENCES, JSON.stringify(references));
  } catch {
    // shih saveStartedAt
  }
}

export function saveStep(step: number): void {
  try {
    localStorage.setItem(KEY_STEP, String(step));
  } catch {
    // shih saveStartedAt
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY_STARTED_AT);
    localStorage.removeItem(KEY_ANSWERS);
    localStorage.removeItem(KEY_REFERENCES);
    localStorage.removeItem(KEY_STEP);
  } catch {
    // shih saveStartedAt
  }
}
