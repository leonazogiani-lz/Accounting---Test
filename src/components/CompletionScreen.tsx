import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { sendFeedbackEmail, type FeedbackPayload } from '../lib/submit';
import { formatTime } from '../lib/time';

export type SubmitResult = {
  status: 'sending' | 'delivered';
  autoSubmitted: boolean;
  timeUsedSeconds: number;
  candidate: { name: string; phone: string };
};

const DIFFICULTY_LABELS = ['Shumë i lehtë', 'I lehtë', 'Mesatar', 'I vështirë', 'Shumë i vështirë'];

type FeedbackState = 'idle' | 'sending' | 'done';

function FeedbackCard({ candidate }: { candidate: { name: string; phone: string } }) {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<FeedbackState>('idle');

  if (state === 'done') {
    return (
      <Card className="mt-10 w-full gap-0 rounded-xl border-slate-200 bg-slate-50 p-6 shadow-none">
        <p className="text-[15px] font-medium text-slate-700">Faleminderit për vlerësimin!</p>
      </Card>
    );
  }

  async function send() {
    if (difficulty === null || state === 'sending') return;
    setState('sending');
    const payload: FeedbackPayload = {
      candidate,
      difficulty,
      difficultyLabel: DIFFICULTY_LABELS[difficulty - 1],
      comment: comment.trim(),
      submittedAt: new Date().toISOString(),
    };
    // Dështimi është i heshtur (vetëm në console) — kandidati sheh gjithmonë falënderimin
    await sendFeedbackEmail(payload);
    setState('done');
  }

  return (
    <Card className="mt-10 w-full gap-0 rounded-xl border-slate-200 bg-slate-50 p-6 text-center shadow-none">
      <p className="text-[15px] font-semibold text-slate-700">Sa i vështirë ju duk testi?</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {DIFFICULTY_LABELS.map((label, i) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            onClick={() => setDifficulty(i + 1)}
            className={cn(
              'h-auto rounded-full px-4 py-2 text-sm font-medium shadow-none',
              difficulty === i + 1
                ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500 hover:bg-white hover:text-slate-600',
            )}
          >
            {label}
          </Button>
        ))}
      </div>
      <Textarea
        rows={3}
        autoComplete="off"
        placeholder="Komenti juaj (opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mt-4 h-auto resize-none rounded-lg border-slate-300 bg-white px-4 py-3 text-sm shadow-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10"
      />
      <div>
        <Button
          type="button"
          onClick={() => void send()}
          disabled={difficulty === null || state === 'sending'}
          className="mt-4 h-auto rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
        >
          {state === 'sending' ? 'Duke dërguar…' : 'Dërgo vlerësimin'}
        </Button>
      </div>
    </Card>
  );
}

export default function CompletionScreen({
  result,
  firstName,
}: {
  result: SubmitResult;
  firstName: string;
}) {
  const delivered = result.status === 'delivered';

  useEffect(() => {
    if (!delivered) return;
    const burst = (particleCount: number, spread: number, y: number) =>
      confetti({ particleCount, spread, origin: { y }, disableForReducedMotion: true });
    burst(120, 75, 0.6);
    const timers = [
      setTimeout(() => burst(60, 110, 0.5), 350),
      setTimeout(() => burst(80, 90, 0.55), 750),
    ];
    return () => timers.forEach(clearTimeout);
  }, [delivered]);

  if (result.status === 'sending') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-4 text-slate-900">
        <p className="text-base font-medium text-slate-600">Duke dërguar përgjigjet…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-12 text-center sm:px-6">
        <div className="my-auto flex w-full flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-7 w-7 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <h1 className="mt-6 text-2xl font-bold sm:text-3xl">
            {firstName ? `Faleminderit, ${firstName}!` : 'Faleminderit!'}
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            Përgjigjet tuaja do të shqyrtohen dhe do të merrni një përgjigje brenda 2 javëve.
          </p>

          <p className="mt-6 text-sm text-slate-500">
            Koha e përdorur:{' '}
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatTime(result.timeUsedSeconds)}
            </span>
          </p>

          <FeedbackCard candidate={result.candidate} />
        </div>
      </main>
    </div>
  );
}
