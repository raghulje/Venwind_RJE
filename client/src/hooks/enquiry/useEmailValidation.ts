import { useCallback, useMemo } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function useEmailValidation(email: string, required: boolean = true) {
  const error = useMemo(() => {
    const v = String(email || '').trim();
    if (!v) return required ? 'Email is required' : null;
    if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
    return null;
  }, [email, required]);

  const validate = useCallback(() => error, [error]);

  return { error, validate };
}

