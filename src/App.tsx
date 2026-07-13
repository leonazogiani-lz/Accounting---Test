import { useCallback, useEffect, useRef, useState } from 'react';
import { CANDIDATE_NAME_ID, questions, TEST_DURATION_SECONDS, type Question } from './questions';
import { DEFAULT_COUNTRY_CODE, findCountry, isValidPhone, phoneLengthError } from './countries';
import {
  clearSession,
  loadSession,
  saveAnswers,
  saveReferences,
  saveStartedAt,
  saveStep,
  type AnswersMap,
  type AnswerValue,
  type PhoneValue,
  type ReferencesMap,
} from './lib/storage';
import { buildPayload, deliver } from './lib/submit';
import { useCountdown } from './hooks/useCountdown';
import IntroScreen from './components/IntroScreen';
import QuestionStep from './components/QuestionStep';
import CompletionScreen, { type SubmitResult } from './components/CompletionScreen';
import TimerBadge from './components/TimerBadge';
import Toast from './components/Toast';
import { isValidReference } from './components/ReferenceLinks';

type Phase = 'intro' | 'test' | 'done';

const TOAST_THRESHOLDS_SECONDS = [10 * 60, 5 * 60];

function asPhoneValue(value: AnswerValue | undefined): PhoneValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : { country: DEFAULT_COUNTRY_CODE, number: '' };
}

function isAnswered(question: Question, value: AnswerValue | undefined): boolean {
  if (question.type === 'checkbox') return Array.isArray(value) && value.length > 0;
  if (question.type === 'phone') return asPhoneValue(value).number.trim() !== '';
  return typeof value === 'string' && value.trim().length > 0;
}

function firstNameFrom(value: AnswerValue | undefined): string {
  if (typeof value !== 'string') return '';
  const first = value.trim().split(/\s+/)[0] ?? '';
  return first ? first[0].toUpperCase() + first.slice(1) : '';
}

function personalizeTitle(question: Question, firstName: string): string {
  if (!question.personalize || !firstName) return question.title;
  return `${firstName}, ${question.title[0].toLowerCase()}${question.title.slice(1)}`;
}

export default function App() {
  const [session] = useState(loadSession);
  const [phase, setPhase] = useState<Phase>(session ? 'test' : 'intro');
  const [startedAtMs, setStartedAtMs] = useState<number | null>(
    session ? Date.parse(session.startedAt) : null,
  );
  const [answers, setAnswers] = useState<AnswersMap>(session?.answers ?? {});
  const [references, setReferences] = useState<ReferencesMap>(session?.references ?? {});
  const [step, setStep] = useState(() =>
    session ? Math.min(Math.max(session.step, 0), questions.length - 1) : 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const referencesRef = useRef(references);
  referencesRef.current = references;
  const submittingRef = useRef(false);
  const prevRemainingRef = useRef<number | null>(null);

  const remaining = useCountdown(phase === 'test' ? startedAtMs : null, TEST_DURATION_SECONDS);
  const locked = phase === 'test' && remaining <= 0;
  const firstName = firstNameFrom(answers[CANDIDATE_NAME_ID]);

  const handleSubmit = useCallback(
    async (autoSubmitted: boolean) => {
      if (submittingRef.current || startedAtMs === null) return;
      submittingRef.current = true;

      const submittedAtMs = Date.now();
      const timeUsedSeconds = Math.max(
        0,
        Math.min(TEST_DURATION_SECONDS, Math.round((submittedAtMs - startedAtMs) / 1000)),
      );
      const payload = buildPayload(
        answersRef.current,
        referencesRef.current,
        startedAtMs,
        submittedAtMs,
        timeUsedSeconds,
        autoSubmitted,
      );

      setPhase('done');
      setToast(null);
      setResult({ status: 'sending', autoSubmitted, timeUsedSeconds, candidate: payload.candidate });

      const delivery = await deliver(payload, 'test-kontabilist', payload.submittedAt);
      clearSession();
      setResult({
        status: 'delivered',
        delivery,
        autoSubmitted,
        timeUsedSeconds,
        candidate: payload.candidate,
      });
    },
    [startedAtMs],
  );

  // Në 00:00 testi dërgohet vetvetiu — vlen edhe kur faqja hapet pasi koha ka skaduar
  useEffect(() => {
    if (phase === 'test' && startedAtMs !== null && remaining <= 0) {
      void handleSubmit(true);
    }
  }, [phase, startedAtMs, remaining, handleSubmit]);

  useEffect(() => {
    if (phase !== 'test') return;
    const prev = prevRemainingRef.current;
    prevRemainingRef.current = remaining;
    if (prev === null) return;
    for (const threshold of TOAST_THRESHOLDS_SECONDS) {
      if (prev > threshold && remaining <= threshold && remaining > 0) {
        setToast(`Ju kanë mbetur ${Math.ceil(remaining / 60)} minuta`);
      }
    }
  }, [phase, remaining]);

  useEffect(() => {
    if (phase !== 'test') return;
    const id = setTimeout(() => saveAnswers(answers), 500);
    return () => clearTimeout(id);
  }, [phase, answers]);

  useEffect(() => {
    if (phase !== 'test') return;
    const id = setTimeout(() => saveReferences(references), 500);
    return () => clearTimeout(id);
  }, [phase, references]);

  useEffect(() => {
    if (phase === 'test') saveStep(step);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== 'test') return;
    const warn = (e: BeforeUnloadEvent) => {
      // ruajtja e menjëhershme — debounce-i mund të mos ketë përfunduar
      saveAnswers(answersRef.current);
      saveReferences(referencesRef.current);
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);

  const dismissToast = useCallback(() => setToast(null), []);

  function startTest() {
    const now = Date.now();
    saveStartedAt(new Date(now).toISOString());
    saveAnswers({});
    saveReferences({});
    saveStep(0);
    submittingRef.current = false;
    prevRemainingRef.current = null;
    setAnswers({});
    setReferences({});
    setStep(0);
    setError(null);
    setStartedAtMs(now);
    setPhase('test');
    setToast('Mirë se vini! Ju urojmë shumë suksese 🍀');
  }

  function handleChange(question: Question, value: AnswerValue) {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setError(null);
  }

  function handleReferencesChange(question: Question, links: string[]) {
    if (locked) return;
    setReferences((prev) => ({ ...prev, [question.id]: links }));
    setError(null);
  }

  function goBack() {
    if (step === 0) return;
    setStep(step - 1);
    setError(null);
  }

  function goNext() {
    if (locked) return;
    const question = questions[step];
    const value = answers[question.id];
    if (question.required && !isAnswered(question, value)) {
      setError('Kjo pyetje është e detyrueshme');
      return;
    }
    if (question.type === 'phone') {
      const phone = asPhoneValue(value);
      const country = findCountry(phone.country);
      if (!isValidPhone(country, phone.number)) {
        setError(phoneLengthError(country));
        return;
      }
    }
    if (question.allowReferences && (references[question.id] ?? []).some((l) => !isValidReference(l))) {
      setError('Njëra nga referencat nuk është link i vlefshëm (duhet të fillojë me https:// ose www.)');
      return;
    }
    setError(null);
    if (step === questions.length - 1) {
      void handleSubmit(false);
    } else {
      setStep(step + 1);
    }
  }

  if (phase === 'intro') return <IntroScreen onStart={startTest} />;
  if (phase === 'done' && result) return <CompletionScreen result={result} firstName={firstName} />;
  if (phase === 'done') return null;

  const question = questions[step];

  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold">Kontabilist i Brendshëm</span>
          <TimerBadge remainingSeconds={remaining} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="my-auto w-full">
          <QuestionStep
            question={question}
            displayTitle={personalizeTitle(question, firstName)}
            index={step}
            total={questions.length}
            value={answers[question.id]}
            references={references[question.id] ?? []}
            error={error}
            locked={locked}
            isLast={step === questions.length - 1}
            onChange={(value) => handleChange(question, value)}
            onReferencesChange={(links) => handleReferencesChange(question, links)}
            onBack={goBack}
            onNext={goNext}
          />
        </div>
      </main>

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}
