interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "base" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "base",
  onClick,
  disabled,
  href,
  type = "button",
  children,
  style,
  className,
}: ButtonProps) {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const classStr = `${baseClass} ${variantClass} ${sizeClass}${className ? ` ${className}` : ""}`.trim();

  if (href) {
    return (
      <a
        href={href}
        className={classStr}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classStr}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
