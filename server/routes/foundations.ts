import express from 'express';
import { body, param } from 'express-validator';
import { FoundationController } from '../controllers/FoundationController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Get all foundations for user
router.get('/', FoundationController.getUserFoundations);

// Get foundation by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  requireFoundationAccess,
  FoundationController.getFoundationById
);

// Create new foundation
router.post('/',
  [
    body('name').trim().isLength({ min: 2 }),
    body('registration_number').optional().trim(),
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('website').optional().isURL()
  ],
  validateRequest,
  FoundationController.createFoundation
);

// Update foundation
router.put('/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('website').optional().isURL()
  ],
  validateRequest,
  requireFoundationAccess,
  FoundationController.updateFoundation
);

// Delete foundation
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  requireFoundationAccess,
  FoundationController.deleteFoundation
);

// Get foundation members
router.get('/:id/members',
  [param('id').isUUID()],
  validateRequest,
  requireFoundationAccess,
  FoundationController.getFoundationMembers
);

// Add foundation member
router.post('/:id/members',
  [
    param('id').isUUID(),
    body('user_id').isUUID(),
    body('role').isIn(['owner', 'admin', 'member', 'viewer'])
  ],
  validateRequest,
  requireFoundationAccess,
  FoundationController.addFoundationMember
);

// Update foundation member
router.put('/:id/members/:userId',
  [
    param('id').isUUID(),
    param('userId').isUUID(),
    body('role').isIn(['owner', 'admin', 'member', 'viewer'])
  ],
  validateRequest,
  requireFoundationAccess,
  FoundationController.updateFoundationMember
);

// Remove foundation member
router.delete('/:id/members/:userId',
  [
    param('id').isUUID(),
    param('userId').isUUID()
  ],
  validateRequest,
  requireFoundationAccess,
  FoundationController.removeFoundationMember
);

export default router;