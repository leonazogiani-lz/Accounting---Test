type Props = {
  links: string[];
  locked: boolean;
  onChange: (links: string[]) => void;
  inputClass: string;
};

// Bosh lejohet (hiqet para dërgimit); vlerat e plotësuara duhet të duken si link
export function isValidReference(link: string): boolean {
  const trimmed = link.trim();
  if (trimmed === '') return true;
  return /^(https?:\/\/|www\.)\S+\.\S{2,}/i.test(trimmed);
}

export default function ReferenceLinks({ links, locked, onChange, inputClass }: Props) {
  return (
    <div className="mt-5 text-left">
      <p className="text-sm font-medium text-slate-500">
        Referencat — ligje, udhëzime, linqe (opsionale)
      </p>
      {links.map((link, i) => (
        <div key={i} className="mt-2 flex items-center gap-2">
          <input
            type="url"
            autoComplete="off"
            placeholder="https://…"
            value={link}
            disabled={locked}
            onChange={(e) => onChange(links.map((l, j) => (j === i ? e.target.value : l)))}
            className={`${inputClass} py-2.5 text-sm ${
              isValidReference(link) ? '' : 'border-red-400 focus:border-red-500'
            }`}
          />
          <button
            type="button"
            aria-label="Hiq referencën"
            disabled={locked}
            onClick={() => onChange(links.filter((_, j) => j !== i))}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange([...links, ''])}
        className="mt-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 disabled:opacity-40"
      >
        + Shto referencë
      </button>
    </div>
  );
}
