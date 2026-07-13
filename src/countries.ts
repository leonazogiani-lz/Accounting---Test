export type Country = {
  code: string;
  name: string;
  flag: string;
  prefix: string;
  minDigits: number;
  maxDigits: number;
};

// Gjatësitë janë për numrin kombëtar pa prefiks dhe pa zeron e parë.
export const countries: Country[] = [
  { code: 'XK', name: 'Kosova', flag: '🇽🇰', prefix: '+383', minDigits: 8, maxDigits: 9 },
  { code: 'AL', name: 'Shqipëria', flag: '🇦🇱', prefix: '+355', minDigits: 8, maxDigits: 9 },
  { code: 'DE', name: 'Gjermania', flag: '🇩🇪', prefix: '+49', minDigits: 7, maxDigits: 11 },
  { code: 'GB', name: 'Mbretëria e Bashkuar', flag: '🇬🇧', prefix: '+44', minDigits: 9, maxDigits: 10 },
  { code: 'US', name: 'SHBA', flag: '🇺🇸', prefix: '+1', minDigits: 10, maxDigits: 10 },
  { code: 'CH', name: 'Zvicra', flag: '🇨🇭', prefix: '+41', minDigits: 9, maxDigits: 9 },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', prefix: '+43', minDigits: 7, maxDigits: 12 },
  { code: 'FR', name: 'Franca', flag: '🇫🇷', prefix: '+33', minDigits: 9, maxDigits: 9 },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', prefix: '+39', minDigits: 8, maxDigits: 11 },
];

export const DEFAULT_COUNTRY_CODE = 'XK';

export function findCountry(code: string): Country {
  return countries.find((c) => c.code === code) ?? countries[0];
}

// '044 123 456' → '44123456' — zeroja e parë është prefiks kombëtar, jo pjesë e numrit
export function nationalDigits(number: string): string {
  const digits = number.replace(/\D/g, '');
  return digits.startsWith('0') ? digits.slice(1) : digits;
}

export function isValidPhone(country: Country, number: string): boolean {
  const len = nationalDigits(number).length;
  return len >= country.minDigits && len <= country.maxDigits;
}

export function formatInternational(country: Country, number: string): string {
  return `${country.prefix} ${nationalDigits(number)}`;
}

export function phoneLengthError(country: Country): string {
  const range =
    country.minDigits === country.maxDigits
      ? `${country.minDigits}`
      : `${country.minDigits}–${country.maxDigits}`;
  return `Numri i telefonit duhet të ketë ${range} shifra (${country.name} ${country.prefix})`;
}
