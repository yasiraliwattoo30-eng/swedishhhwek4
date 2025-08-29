import express from 'express';
import { body, param } from 'express-validator';
import { ProfileController } from '../controllers/ProfileController';
import { validateRequest } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = express.Router();

// Get current user profile
router.get('/me', ProfileController.getCurrentProfile);

// Update current user profile
router.put('/me',
  [
    body('full_name').optional().trim().isLength({ min: 2 }),
    body('avatar_url').optional().isURL()
  ],
  validateRequest,
  ProfileController.updateCurrentProfile
);

// Upload avatar
router.post('/me/avatar',
  upload.single('avatar'),
  ProfileController.uploadAvatar
);

// Get user profile by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  ProfileController.getProfileById
);

// Search profiles
router.get('/search/:query',
  [param('query').trim().isLength({ min: 2 })],
  validateRequest,
  ProfileController.searchProfiles
);

export default router;