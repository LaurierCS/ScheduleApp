import { useState } from "react";

/**
 * Hook for form field validation with email support
 * Provides validation state and setter, plus validation helper functions
 */
export const useFormValidation = () => {
    const [validationError, setValidationError] = useState("");

    /**
     * Validate email format
     */
    const isEmailValid = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    /**
     * Validate email with optional error message setter
     */
    const validateEmail = (email: string, shouldSetError = false): boolean => {
        const isValid = isEmailValid(email);
        if (shouldSetError && !isValid) {
            setValidationError("Please enter a valid email");
        }
        return isValid;
    };

    /**
     * Clear validation error
     */
    const clearError = () => setValidationError("");

    /**
     * Set a custom validation error message
     */
    const setError = (message: string) => setValidationError(message);

    return {
        validationError,
        setValidationError: setError,
        clearError,
        isEmailValid,
        validateEmail,
    };
};
