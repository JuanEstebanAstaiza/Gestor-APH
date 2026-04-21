import { useState, useEffect, useCallback } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useCallback(
    (val: string) => {
      const timer = setTimeout(() => onSearch(val), 300);
      return () => clearTimeout(timer);
    },
    [onSearch],
  );

  useEffect(() => debouncedSearch(value), [value, debouncedSearch]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "10px 14px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        fontSize: 14,
        width: 300,
        outline: "none",
      }}
    />
  );
}
