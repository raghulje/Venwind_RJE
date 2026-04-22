import { useCallback, useMemo } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function isValidInternationalPhone(phoneE164: string): boolean {
  const v = String(phoneE164 || '').trim();
  if (!v) return false;
  const parsed = parsePhoneNumberFromString(v);
  return Boolean(parsed && parsed.isValid());
}

export function usePhoneValidation(phoneE164: string, required: boolean = true) {
  const error = useMemo(() => {
    const v = String(phoneE164 || '').trim();
    if (!v) return required ? 'Enter a valid phone number' : null;
    return isValidInternationalPhone(v) ? null : 'Enter a valid phone number';
  }, [phoneE164, required]);

  const validate = useCallback(() => error, [error]);

  return { error, validate };
}

