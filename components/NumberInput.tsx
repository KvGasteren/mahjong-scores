// components/NumberInput.tsx
'use client';
import { useState, useEffect, ChangeEvent, KeyboardEvent, FocusEvent } from 'react';

type Props = {
  value: number | '';
  onChange: (v: number) => void;
  step?: number;
  className?: string;
};

/**
 * Spinnerless numeric input:
 * - Shows numeric keyboard on mobile (inputMode="numeric")
 * - Allows typing negatives
 * - Does not commit until Enter or blur
 */
export default function NumberInput({
  value,
  onChange,
  step = 1,
  className = '',
}: Props) {
  const [text, setText] = useState(String(value));

  // keep text in sync if parent updates externally
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const parseNumber = (val: string): number | null => {
    if (val.trim() === '' || val === '-') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value); // update local state, but do not propagate yet
  };

  const commitValue = (val: string) => {
    const parsed = parseNumber(val);
    if (parsed !== null) {
      onChange(parsed);
      setText(String(parsed)); // normalize formatting
    } else {
      // if invalid (e.g. just "-"), revert to empty string
      setText('');
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    commitValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).blur(); // remove focus after Enter
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="-?\\d*"
      step={step}
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`w-full rounded-xl border border-neutral-300 px-2 py-1 text-sm font-mono ${className}`}
    />
  );
}
