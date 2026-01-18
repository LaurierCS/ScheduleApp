import { ValidationError, AuthenticationError } from '../errors';
import CodeGenerator from './codeGenerator';
import type { IUser } from '../models/user';

/**
 * Utility functions for password reset flow
 */
class PasswordResetUtil {
  /**
   * Validate password reset request inputs
   */
  static validateResetInput(currentPassword: string, newPassword: string, confirmPassword: string): void {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError('Current password, new password, and confirmation are required');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('New passwords do not match');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }
  }

  /**
   * Verify current password is correct
   */
  static async verifyCurrentPassword(user: IUser, currentPassword: string): Promise<void> {
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }
  }

  /**
   * Generate and store verification code
   */
  static generateVerificationCode(user: IUser): string {
    const code = CodeGenerator.generate6DigitCode();
    user.pendingNewPassword = undefined;
    user.twoFactorCode = CodeGenerator.hashCode(code);
    user.twoFactorCodeExpiry = CodeGenerator.getCodeExpiration();
    return code;
  }

  /**
   * Validate verification code
   */
  static validateVerificationCode(code: string, user: IUser): void {
    if (!code) {
      throw new ValidationError('Verification code is required');
    }

    if (!/^\d{6}$/.test(code)) {
      throw new ValidationError('Verification code must be 6 digits');
    }

    const hashedCode = CodeGenerator.hashCode(code);

    if (user.twoFactorCode !== hashedCode) {
      throw new AuthenticationError('Invalid verification code');
    }

    if (!user.twoFactorCodeExpiry || new Date() > user.twoFactorCodeExpiry) {
      throw new AuthenticationError('Verification code has expired');
    }
  }

  /**
   * Update password and clear temporary fields
   */
  static updatePassword(user: IUser): void {
    if (!user.pendingNewPassword) {
      throw new AuthenticationError('No pending password found');
    }

    user.password = user.pendingNewPassword;
    user.pendingNewPassword = undefined;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpiry = undefined;
  }

  /**
   * Clear reset data on error
   */
  static clearResetData(user: IUser): void {
    user.pendingNewPassword = undefined;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpiry = undefined;
  }
}

export default PasswordResetUtil;
