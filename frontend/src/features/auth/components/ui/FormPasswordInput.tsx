import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface FormPasswordInputProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
}

/**
 * Reusable password input component with show/hide toggle
 * Consolidates repeated password field and toggle logic
 */
export const FormPasswordInput: React.FC<FormPasswordInputProps> = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  autoComplete,
  required,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2 md:space-y-3">
      <label htmlFor={id} className="block text-sm md:text-base font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 pr-12 border border-black"
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent focus:outline-none"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </div>
  );
};
