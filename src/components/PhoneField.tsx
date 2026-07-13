import { countries } from '../countries';
import type { PhoneValue } from '../lib/storage';

type Props = {
  value: PhoneValue;
  locked: boolean;
  onChange: (value: PhoneValue) => void;
  onEnter: () => void;
  inputClass: string;
};

export default function PhoneField({ value, locked, onChange, onEnter, inputClass }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        aria-label="Shteti"
        value={value.country}
        disabled={locked}
        onChange={(e) => onChange({ ...value, country: e.target.value })}
        className={`${inputClass} sm:w-64 sm:shrink-0`}
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name} ({c.prefix})
          </option>
        ))}
      </select>
      <input
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
        className={inputClass}
      />
    </div>
  );
}
