import { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

const InlineEdit = ({ value, onChange, className, style, multiline }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft);
    else setDraft(value);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:ring-2 hover:ring-primary/40 rounded px-0.5 transition-all ${className}`}
        style={style}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        {value}
      </span>
    );
  }

  const shared = {
    ref: ref as any,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
      if (e.key === "Escape") { setDraft(value); setEditing(false); }
    },
    className: `bg-transparent border-none outline-none ring-2 ring-primary/60 rounded px-0.5 w-full resize-none ${className}`,
    style,
  };

  return multiline ? <textarea {...shared} rows={3} /> : <input {...shared} />;
};

export default InlineEdit;
