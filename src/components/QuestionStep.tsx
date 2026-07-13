import { useLayoutEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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

// Mban pamjen e mëparshme të fushave mbi bazën e komponentëve shadcn
const fieldClass =
  'h-auto rounded-lg border-slate-300 px-4 py-3 text-base md:text-base shadow-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-100';

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
      <Progress
        value={((index + 1) / total) * 100}
        className="mx-auto mt-3 h-1.5 w-full max-w-md bg-slate-100"
      />

      <h2 className="mt-8 text-center text-lg leading-relaxed font-semibold text-balance text-slate-900 sm:text-xl">
        {displayTitle}
      </h2>

      <div className="mt-6">
        {question.type === 'short' && (
          <Input
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
            className={fieldClass}
          />
        )}

        {question.type === 'phone' && (
          <PhoneField
            value={phone}
            locked={locked}
            onChange={onChange}
            onEnter={onNext}
            fieldClass={fieldClass}
          />
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-2.5">
            {question.options?.map((option, i) => (
              <Label
                key={option}
                htmlFor={`${question.id}-${i}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 leading-normal font-normal transition select-none hover:bg-slate-50 has-[[data-state=checked]]:border-slate-900 has-[[data-state=checked]]:bg-slate-50"
              >
                <Checkbox
                  id={`${question.id}-${i}`}
                  disabled={locked}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) =>
                    onChange(
                      checked === true
                        ? [...selected, option]
                        : selected.filter((o) => o !== option),
                    )
                  }
                  className="mt-0.5"
                />
                <span className="text-[15px] text-slate-800">{option}</span>
              </Label>
            ))}
          </div>
        )}

        {question.type === 'long' && (
          <>
            <Textarea
              ref={textareaRef}
              rows={6}
              autoComplete="off"
              value={text}
              disabled={locked}
              onChange={(e) => onChange(e.target.value)}
              className={cn(fieldClass, 'resize-none overflow-hidden leading-relaxed')}
            />
            <p className="mt-1.5 text-right text-xs text-slate-400 tabular-nums">
              {text.length} karaktere
            </p>
            {question.allowReferences && (
              <ReferenceLinks
                links={references}
                locked={locked}
                onChange={onReferencesChange}
                fieldClass={fieldClass}
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
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={index === 0 || locked}
          className="h-auto rounded-lg border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50 disabled:opacity-40"
        >
          Prapa
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={locked}
          className="h-auto rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
        >
          {isLast ? 'Dërgo testin' : 'Vazhdo'}
        </Button>
      </div>
    </div>
  );
}
