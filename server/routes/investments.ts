import express from 'express';
import { body, param, query } from 'express-validator';
import { InvestmentController } from '../controllers/InvestmentController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Get investments with filters
router.get('/',
  [
    query('foundation_id').optional().isUUID(),
    query('type').optional().isIn(['stock', 'bond', 'mutual_fund', 'real_estate', 'commodity', 'cash', 'other'])
  ],
  validateRequest,
  InvestmentController.getInvestments
);

// Get investment by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  InvestmentController.getInvestmentById
);

// Create new investment
router.post('/',
  [
    body('foundation_id').isUUID(),
    body('type').isIn(['stock', 'bond', 'mutual_fund', 'real_estate', 'commodity', 'cash', 'other']),
    body('name').trim().isLength({ min: 2 }),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isIn(['SEK', 'EUR', 'USD']),
    body('acquisition_date').isDate(),
    body('current_value').optional().isFloat({ min: 0 }),
    body('performance').optional().isFloat(),
    body('notes').optional().trim()
  ],
  validateRequest,
  requireFoundationAccess,
  InvestmentController.createInvestment
);

// Update investment
router.put('/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('current_value').optional().isFloat({ min: 0 }),
    body('performance').optional().isFloat(),
    body('notes').optional().trim()
  ],
  validateRequest,
  InvestmentController.updateInvestment
);

// Delete investment
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  InvestmentController.deleteInvestment
);

// Get investment performance history
router.get('/:id/performance',
  [param('id').isUUID()],
  validateRequest,
  InvestmentController.getInvestmentPerformance
);

// Update investment value
router.post('/:id/update-value',
  [
    param('id').isUUID(),
    body('current_value').isFloat({ min: 0 }),
    body('performance').optional().isFloat()
  ],
  validateRequest,
  InvestmentController.updateInvestmentValue
);

export default router;