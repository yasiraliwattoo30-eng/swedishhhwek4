import express from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').trim().isLength({ min: 2 })
  ],
  validateRequest,
  AuthController.register
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  AuthController.login
);

// Logout user
router.post('/logout', AuthController.logout);

// Refresh token
router.post('/refresh', AuthController.refreshToken);

// Forgot password
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  AuthController.forgotPassword
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  validateRequest,
  AuthController.resetPassword
);

// Verify email
router.post('/verify-email',
  [body('token').notEmpty()],
  validateRequest,
  AuthController.verifyEmail
);

export default router;