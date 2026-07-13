import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  links: string[];
  locked: boolean;
  onChange: (links: string[]) => void;
  fieldClass: string;
};

// Bosh lejohet (hiqet para dërgimit); vlerat e plotësuara duhet të duken si link
export function isValidReference(link: string): boolean {
  const trimmed = link.trim();
  if (trimmed === '') return true;
  return /^(https?:\/\/|www\.)\S+\.\S{2,}/i.test(trimmed);
}

export default function ReferenceLinks({ links, locked, onChange, fieldClass }: Props) {
  return (
    <div className="mt-5 text-left">
      <p className="text-sm font-medium text-slate-500">
        Referencat — ligje, udhëzime, linqe (opsionale)
      </p>
      {links.map((link, i) => (
        <div key={i} className="mt-2 flex items-center gap-2">
          <Input
            type="url"
            autoComplete="off"
            placeholder="https://…"
            value={link}
            disabled={locked}
            onChange={(e) => onChange(links.map((l, j) => (j === i ? e.target.value : l)))}
            className={cn(
              fieldClass,
              'py-2.5 text-sm md:text-sm',
              !isValidReference(link) && 'border-red-400 focus-visible:border-red-500',
            )}
          />
          <Button
            type="button"
            variant="outline"
            aria-label="Hiq referencën"
            disabled={locked}
            onClick={() => onChange(links.filter((_, j) => j !== i))}
            className="h-auto rounded-lg border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-500 shadow-none hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        disabled={locked}
        onClick={() => onChange([...links, ''])}
        className="mt-2 h-auto p-0 text-sm font-semibold text-slate-600 hover:bg-transparent hover:text-slate-900 disabled:opacity-40"
      >
        + Shto referencë
      </Button>
    </div>
  );
}
