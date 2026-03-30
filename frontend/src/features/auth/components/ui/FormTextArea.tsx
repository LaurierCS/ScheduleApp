import React from "react";

interface FormTextAreaProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

/**
 * Reusable textarea component with label and optional error message
 */
export const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  error,
  required,
  disabled = false,
  rows = 4,
}) => {
  return (
    <div className="space-y-2 md:space-y-3">
      <label htmlFor={id} className="block text-sm md:text-base font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-md text-sm md:text-base px-4 py-3 border border-black resize-none ${
          disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs md:text-sm text-red-600">{error}</p>}
    </div>
  );
};
