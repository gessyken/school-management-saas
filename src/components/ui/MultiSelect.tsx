import React from "react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (newValues: string[]) => void;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const toggleOption = (option: string) => {
    if (disabled) return;
    const newValues = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValues);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggleOption(option)}
          className={`px-3 py-1 rounded-full text-sm border ${
            value.includes(option)
              ? "bg-skyblue text-white border-skyblue"
              : "bg-white text-foreground border-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
