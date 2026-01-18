import crypto from 'crypto';

/**
 * Code Generator Utility
 * Generates and hashes verification codes
 */
class CodeGenerator {
  /**
   * Generate a random 6-digit code
   * @returns 6-digit code as string
   */
  static generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash a code using SHA256
   * @param code - The code to hash
   * @returns Hashed code
   */
  static hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Get expiration time for verification code (5 minutes)
   * @returns Date object representing expiration time
   */
  static getCodeExpiration(): Date {
    return new Date(Date.now() + 5 * 60 * 1000);
  }
}

export default CodeGenerator;
