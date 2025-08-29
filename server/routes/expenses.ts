import express from 'express';
import { body, param, query } from 'express-validator';
import { ExpenseController } from '../controllers/ExpenseController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Get expenses with filters
router.get('/',
  [
    query('foundation_id').optional().isUUID(),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('category').optional().isIn(['office_supplies', 'travel', 'meals', 'utilities', 'professional_services', 'marketing', 'other'])
  ],
  validateRequest,
  ExpenseController.getExpenses
);

// Get expense by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  ExpenseController.getExpenseById
);

// Create new expense
router.post('/',
  upload.single('receipt'),
  [
    body('foundation_id').isUUID(),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isIn(['SEK', 'EUR', 'USD']),
    body('category').isIn(['office_supplies', 'travel', 'meals', 'utilities', 'professional_services', 'marketing', 'other']),
    body('description').trim().isLength({ min: 2 }),
    body('expense_date').isDate()
  ],
  validateRequest,
  requireFoundationAccess,
  ExpenseController.createExpense
);

// Update expense
router.put('/:id',
  [
    param('id').isUUID(),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('category').optional().isIn(['office_supplies', 'travel', 'meals', 'utilities', 'professional_services', 'marketing', 'other']),
    body('description').optional().trim().isLength({ min: 2 }),
    body('expense_date').optional().isDate(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']),
    body('rejection_reason').optional().trim()
  ],
  validateRequest,
  ExpenseController.updateExpense
);

// Delete expense
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  ExpenseController.deleteExpense
);

// Approve expense
router.post('/:id/approve',
  [param('id').isUUID()],
  validateRequest,
  ExpenseController.approveExpense
);

// Reject expense
router.post('/:id/reject',
  [
    param('id').isUUID(),
    body('rejection_reason').trim().isLength({ min: 2 })
  ],
  validateRequest,
  ExpenseController.rejectExpense
);

// Download receipt
router.get('/:id/receipt',
  [param('id').isUUID()],
  validateRequest,
  ExpenseController.downloadReceipt
);

export default router;