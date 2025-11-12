import { Router, Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user';
import RefreshToken from '../models/RefreshToken';
import JWTUtils from '../utils/jwt';
import { authenticate } from '../middleware/authMiddleware';
import { ApiResponseUtil } from '../utils/apiResponse';
import { ValidationError, AuthenticationError } from '../errors';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with JWT authentication
 * @access  Public
 * @permissions Creates new user with CANDIDATE role by default (RBAC)
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            throw new ValidationError('Name, email, and password are required');
        }

        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new ValidationError('User already exists with this email');
        }

        // Create user with CANDIDATE role (default for new users per RBAC)
        // Password will be hashed automatically by the pre-save middleware
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: UserRole.CANDIDATE, // Default role for new registrations
            isActive: true
        });

        await user.save();

        // Generate JWT tokens
        const accessToken = JWTUtils.generateAccessToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        const refreshToken = JWTUtils.generateRefreshToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        // Store refresh token in database for validation
        await new RefreshToken({
            token: refreshToken,
            userId: user._id,
            expiresAt: JWTUtils.getTokenExpiration(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @permissions Validates user credentials and enforces isActive status (RBAC)
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        // Find user and validate credentials
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Check if user account is active (RBAC: inactive users cannot login)
        if (!user.isActive) {
            throw new AuthenticationError('Account is deactivated');
        }

        // Verify password using bcrypt comparePassword method
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT tokens with user role for RBAC
        const accessToken = JWTUtils.generateAccessToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        const refreshToken = JWTUtils.generateRefreshToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        // Store refresh token in database
        await new RefreshToken({
            token: refreshToken,
            userId: user._id,
            expiresAt: JWTUtils.getTokenExpiration(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationError('Refresh token is required');
        }

        // Verify refresh token signature
        const payload = JWTUtils.verifyRefreshToken(refreshToken);

        // Check if refresh token exists in database and is not revoked
        const tokenValid = await RefreshToken.isTokenValid(refreshToken);
        if (!tokenValid) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        // Validate user still exists and is active (RBAC check)
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError('User not found or inactive');
        }

        // Generate new access token with current user role
        const newAccessToken = JWTUtils.generateAccessToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token (alias for /refresh)
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationError('Refresh token is required');
        }

        // Verify refresh token signature
        const payload = JWTUtils.verifyRefreshToken(refreshToken);

        // Check if refresh token exists in database and is not revoked
        const tokenValid = await RefreshToken.isTokenValid(refreshToken);
        if (!tokenValid) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        // Validate user still exists and is active (RBAC check)
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError('User not found or inactive');
        }

        // Generate new access token with current user role
        const newAccessToken = JWTUtils.generateAccessToken({
            userId: String(user._id),
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by revoking refresh token(s)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can logout
 * 
 * Note: Can revoke specific refresh token or all tokens for user
 * For resource ownership validation, use PermissionChecker.requireOwnership() from utils/permissions.ts
 */
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Revoke specific refresh token
            await RefreshToken.revokeToken(refreshToken);
        } else {
            // Revoke all refresh tokens for user (logout from all devices)
            // req.user is a full IUser document; use _id (ObjectId) when revoking tokens
            await RefreshToken.revokeAllForUser(req.user!._id as any);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user's profile information
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own profile
 * 
 * Note: Uses authenticate middleware which validates JWT and enforces isActive status
 * For viewing other users' profiles, use PermissionChecker.canViewUserResources() from utils/permissions.ts
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch full user profile (password excluded via select)
        // req.user is a full IUser document attached by authenticate middleware
        const user = await User.findById(req.user!._id).select('-password');

        if (!user) {
            throw new AuthenticationError('User not found');
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    teamId: user.teamId,
                    groupIds: user.groupIds,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @todo    Implement password reset email functionality
 */
router.post('/forgot-password', (req, res) => {
    ApiResponseUtil.success(res, null, 'Forgot password route - will be implemented in future');
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public (with reset token)
 * @todo    Implement password reset functionality
 */
router.post('/reset-password', (req, res) => {
    ApiResponseUtil.success(res, null, 'Reset password route - will be implemented in future');
});

export default router;