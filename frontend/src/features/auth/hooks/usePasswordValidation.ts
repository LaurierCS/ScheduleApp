import { useMemo } from "react";

export interface PasswordValidation {
    len: boolean;
    upper: boolean;
    lower: boolean;
    digit: boolean;
    special: boolean;
}

/**
 * Hook to validate password complexity requirements
 * Returns an object with boolean flags for each requirement
 */
export const usePasswordValidation = (password: string): PasswordValidation => {
    return useMemo(
        () => ({
            len: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            digit: /\d/.test(password),
            special: /[^\w\s]/.test(password),
        }),
        [password]
    );
};

/**
 * Check if all password requirements are met
 */
export const isPasswordValid = (validation: PasswordValidation): boolean => {
    return validation.len && validation.upper && validation.lower && validation.digit && validation.special;
};
