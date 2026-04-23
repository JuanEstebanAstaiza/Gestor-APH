interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export default function Textarea({
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
  error,
  disabled,
  style,
  id,
}: TextareaProps) {
  const errorClass = error ? "input-error" : "";
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      disabled={disabled}
      className={errorClass}
      style={style}
    />
  );
}
