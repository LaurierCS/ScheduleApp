import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserRole } from '../models/user';

// JWT payload interface
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}

// JWT configuration - using simple values for clarity
// the secrets are stored in the .env file and are used to sign the tokens 
// '||' defines the fallback value if the environment variable is not set
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Token expiration times. These can be set via environment variables and
// may be either a number (seconds) or a string understood by jsonwebtoken
// (for example: '15m', '7d'). If not provided, sensible defaults are used.
const ACCESS_TOKEN_EXPIRES_IN: string | number = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN: string | number = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class JWTUtils {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
        const tokenPayload: JWTPayload = {
            ...payload,
            type: 'access'
        };

        const signOptions: SignOptions = {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
        };

        return jwt.sign(tokenPayload, JWT_SECRET as Secret, signOptions);
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
        const tokenPayload: JWTPayload = {
            ...payload,
            type: 'refresh'
        };
        // include a unique jwtid for refresh tokens to avoid producing identical tokens
        // if generated in the same second with the same payload
        const jwtId = randomUUID();
        const signOptions: SignOptions = {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
            jwtid: jwtId
        };

        return jwt.sign(tokenPayload, JWT_REFRESH_SECRET as Secret, signOptions);
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): any {
        return jwt.decode(token);
    }

    /**
     * Get token expiration time
     */
    static getTokenExpiration(token: string): Date | null {
        const decoded = this.decodeToken(token);
        if (decoded && decoded.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    }
}

export default JWTUtils;