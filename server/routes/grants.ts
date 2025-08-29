import express from 'express';
import { body, param, query } from 'express-validator';
import { GrantController } from '../controllers/GrantController';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Get grants with filters
router.get('/',
  [
    query('project_id').optional().isUUID(),
    query('status').optional().isIn(['applied', 'under_review', 'awarded', 'rejected', 'completed', 'cancelled'])
  ],
  validateRequest,
  GrantController.getGrants
);

// Get grant by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  GrantController.getGrantById
);

// Create new grant application
router.post('/',
  [
    body('project_id').isUUID(),
    body('grant_name').trim().isLength({ min: 2 }),
    body('grantor_name').trim().isLength({ min: 2 }),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isIn(['SEK', 'EUR', 'USD']),
    body('application_date').isDate(),
    body('requirements').optional().isArray(),
    body('reporting_schedule').optional().isArray(),
    body('notes').optional().trim()
  ],
  validateRequest,
  GrantController.createGrant
);

// Update grant
router.put('/:id',
  [
    param('id').isUUID(),
    body('grant_name').optional().trim().isLength({ min: 2 }),
    body('grantor_name').optional().trim().isLength({ min: 2 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('status').optional().isIn(['applied', 'under_review', 'awarded', 'rejected', 'completed', 'cancelled']),
    body('award_date').optional().isDate(),
    body('completion_date').optional().isDate(),
    body('notes').optional().trim()
  ],
  validateRequest,
  GrantController.updateGrant
);

// Delete grant
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  GrantController.deleteGrant
);

export default router;