import { useLayoutEffect, useRef } from 'react';
import type { Question } from '../questions';
import { DEFAULT_COUNTRY_CODE } from '../countries';
import type { AnswerValue, PhoneValue } from '../lib/storage';
import PhoneField from './PhoneField';
import ReferenceLinks from './ReferenceLinks';

type Props = {
  question: Question;
  displayTitle: string;
  index: number;
  total: number;
  value: AnswerValue | undefined;
  references: string[];
  error: string | null;
  locked: boolean;
  isLast: boolean;
  onChange: (value: AnswerValue) => void;
  onReferencesChange: (links: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400';

export default function QuestionStep({
  question,
  displayTitle,
  index,
  total,
  value,
  references,
  error,
  locked,
  isLast,
  onChange,
  onReferencesChange,
  onBack,
  onNext,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const text = typeof value === 'string' ? value : '';
  const selected = Array.isArray(value) ? value : [];
  const phone: PhoneValue =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value
      : { country: DEFAULT_COUNTRY_CODE, number: '' };

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text, question.id]);

  const filterText = (raw: string) =>
    question.inputFilter === 'lettersOnly' ? raw.replace(/[0-9]/g, '') : raw;

  return (
    <div>
      <p className="text-center text-sm font-medium text-slate-500">
        Pyetja {index + 1} nga {total}
      </p>
      <div className="mx-auto mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="mt-8 text-center text-lg leading-relaxed font-semibold text-balance text-slate-900 sm:text-xl">
        {displayTitle}
      </h2>

      <div className="mt-6">
        {question.type === 'short' && (
          <input
            type="text"
            autoComplete="off"
            value={text}
            disabled={locked}
            onChange={(e) => onChange(filterText(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNext();
              }
            }}
            className={inputClass}
          />
        )}

        {question.type === 'phone' && (
          <PhoneField
            value={phone}
            locked={locked}
            onChange={onChange}
            onEnter={onNext}
            inputClass={inputClass}
          />
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-2.5">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 transition select-none has-checked:border-slate-900 has-checked:bg-slate-50 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={selected.includes(option)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, option]
                        : selected.filter((o) => o !== option),
                    )
                  }
                  className="mt-1 h-4 w-4 accent-slate-900"
                />
                <span className="text-[15px] text-slate-800">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'long' && (
          <>
            <textarea
              ref={textareaRef}
              rows={6}
              autoComplete="off"
              value={text}
              disabled={locked}
              onChange={(e) => onChange(e.target.value)}
              className={`${inputClass} resize-none overflow-hidden leading-relaxed`}
            />
            <p className="mt-1.5 text-right text-xs text-slate-400 tabular-nums">
              {text.length} karaktere
            </p>
            {question.allowReferences && (
              <ReferenceLinks
                links={references}
                locked={locked}
                onChange={onReferencesChange}
                inputClass={inputClass}
              />
            )}
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={index === 0 || locked}
          className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prapa
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={locked}
          className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? 'Dërgo testin' : 'Vazhdo'}
        </button>
      </div>
    </div>
  );
}
