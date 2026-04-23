interface InputProps {
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "datetime-local" | "month" | "url" | "search";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
  min?: string;
  max?: string;
}

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  style,
  id,
  min,
  max,
}: InputProps) {
  const errorClass = error ? "input-error" : "";
  const inputType = type === "number" ? "number" : type;

  return (
    <input
      id={id}
      type={inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={errorClass}
      style={style}
      min={type === "number" ? min : undefined}
      max={type === "number" ? max : undefined}
    />
  );
}
