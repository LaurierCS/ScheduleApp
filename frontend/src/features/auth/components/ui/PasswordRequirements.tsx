import React from "react";
import { PasswordValidation } from "../../hooks/usePasswordValidation";

interface PasswordRequirementsProps {
  validation: PasswordValidation;
  showPasswordsMatch?: boolean;
  passwordsMatch?: boolean;
  responsive?: boolean;
}

/**
 * Displays password validation requirements as a grid of checkmarks
 * Shows progress toward meeting all password complexity requirements
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  validation,
  showPasswordsMatch = false,
  passwordsMatch = false,
  responsive = true,
}) => {
  const gapClass = responsive ? "gap-x-3 gap-y-2 mt-3 md:mt-4" : "gap-x-8 gap-y-2";

  return (
    <div className={`grid grid-cols-2 ${gapClass}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            validation.len ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
            validation.len ? "text-green-600" : "text-gray-600"
          }`}
        >
          Use 8 or more characters
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            validation.upper ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
            validation.upper ? "text-green-600" : "text-gray-600"
          }`}
        >
          One Uppercase character
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            validation.lower ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
            validation.lower ? "text-green-600" : "text-gray-600"
          }`}
        >
          One lowercase character
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            validation.special ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
            validation.special ? "text-green-600" : "text-gray-600"
          }`}
        >
          One special character
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            validation.digit ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
            validation.digit ? "text-green-600" : "text-gray-600"
          }`}
        >
          One number
        </span>
      </div>

      {showPasswordsMatch && (
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              passwordsMatch ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          <span
            className={`${responsive ? "text-xs md:text-sm" : "text-sm"} ${
              passwordsMatch ? "text-green-600" : "text-gray-600"
            }`}
          >
            Passwords match
          </span>
        </div>
      )}
    </div>
  );
};
