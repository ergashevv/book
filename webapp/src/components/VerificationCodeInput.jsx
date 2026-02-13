import { useRef, useState, useCallback } from 'react';

const LEN = 4;

export default function VerificationCodeInput({ value, onChange, disabled }) {
  const [local, setLocal] = useState(value?.split('') || ['', '', '', '']);
  const refs = useRef([]);

  const sync = useCallback((arr) => {
    const s = arr.join('');
    setLocal(arr);
    onChange?.(s);
  }, [onChange]);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...local];
    next[i] = v.slice(-1);
    sync(next);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !local[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...local];
      next[i - 1] = '';
      sync(next);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN).split('');
    const next = [...local];
    pasted.forEach((c, j) => { if (j < LEN) next[j] = c; });
    sync(next);
    const last = Math.min(pasted.length, LEN) - 1;
    if (last >= 0) refs.current[last]?.focus();
  };

  return (
    <div className="verification-code" onPaste={handlePaste}>
      {Array.from({ length: LEN }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="verification-code__input"
          value={local[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
