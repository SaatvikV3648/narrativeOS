import { useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
}

export default function TagInput({ value, onChange, placeholder, label, hint }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      {label ? <label className="text-sm font-semibold text-[var(--text-secondary)]">{label}</label> : null}
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <span key={item} className="gradient-border-card inline-flex items-center px-3 py-1.5 text-sm font-semibold text-black">
            <span className="relative z-10">{item}</span>
            <button
              type="button"
              onClick={() => removeTag(item)}
              className="relative z-10 ml-2 text-xs text-[var(--text-muted)] transition hover:text-black"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="spikd-liquid-input"
      />
      {hint ? <p className="text-sm leading-6 text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
