import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { countries } from '../countries';
import type { PhoneValue } from '../lib/storage';

type Props = {
  value: PhoneValue;
  locked: boolean;
  onChange: (value: PhoneValue) => void;
  onEnter: () => void;
  fieldClass: string;
};

export default function PhoneField({ value, locked, onChange, onEnter, fieldClass }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select
        value={value.country}
        disabled={locked}
        onValueChange={(country) => onChange({ ...value, country })}
      >
        <SelectTrigger
          aria-label="Shteti"
          className={cn(
            fieldClass,
            'h-auto w-full justify-between text-base whitespace-normal data-[size=default]:h-auto sm:w-64 sm:shrink-0',
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.prefix})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="p.sh. 44 123 456"
        value={value.number}
        disabled={locked}
        onChange={(e) => onChange({ ...value, number: e.target.value.replace(/[^0-9 ]/g, '') })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
          }
        }}
        className={fieldClass}
      />
    </div>
  );
}
