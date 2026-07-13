import { Badge } from '@/components/ui/badge';
import { formatTime } from '../lib/time';

export default function TimerBadge({ remainingSeconds }: { remainingSeconds: number }) {
  const tone =
    remainingSeconds <= 5 * 60
      ? 'timer-pulse bg-red-100 text-red-700'
      : remainingSeconds <= 10 * 60
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-100 text-slate-700';

  return (
    <Badge
      aria-label="Koha e mbetur"
      className={`gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${tone}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4 opacity-70"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .27.14.52.38.65l3.5 2a.75.75 0 1 0 .74-1.3l-3.12-1.78V5Z"
          clipRule="evenodd"
        />
      </svg>
      {formatTime(remainingSeconds)}
    </Badge>
  );
}
