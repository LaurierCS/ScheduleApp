import React from "react";

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Reusable form input component with label and optional error message
 * Consolidates repeated input field markup across auth components
 */
export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  autoComplete,
  error,
  required,
  disabled = false,
}) => {
  return (
    <div className="space-y-2 md:space-y-3">
      <label htmlFor={id} className="block text-sm md:text-base font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 border border-black ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
        }`}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs md:text-sm text-red-600">{error}</p>}
    </div>
  );
};
