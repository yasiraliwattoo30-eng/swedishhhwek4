import express from 'express';
import { body, param, query } from 'express-validator';
import { FinancialController } from '../controllers/FinancialController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Bookkeeping routes
router.get('/accounts',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  FinancialController.getAccounts
);

router.post('/accounts',
  [
    body('foundation_id').isUUID(),
    body('account_number').trim().isLength({ min: 1 }),
    body('account_name').trim().isLength({ min: 2 }),
    body('account_type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
    body('currency').isIn(['SEK', 'EUR', 'USD'])
  ],
  validateRequest,
  requireFoundationAccess,
  FinancialController.createAccount
);

// Journal entries
router.get('/journal-entries',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  FinancialController.getJournalEntries
);

router.post('/journal-entries',
  [
    body('foundation_id').isUUID(),
    body('entry_date').isDate(),
    body('description').trim().isLength({ min: 2 }),
    body('line_items').isArray({ min: 2 })
  ],
  validateRequest,
  requireFoundationAccess,
  FinancialController.createJournalEntry
);

// Invoicing routes
router.get('/invoices',
  [
    query('foundation_id').optional().isUUID(),
    query('invoice_type').optional().isIn(['sales', 'purchase']),
    query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  ],
  validateRequest,
  FinancialController.getInvoices
);

router.post('/invoices',
  [
    body('foundation_id').isUUID(),
    body('invoice_type').isIn(['sales', 'purchase']),
    body('customer_supplier_name').trim().isLength({ min: 2 }),
    body('invoice_date').isDate(),
    body('due_date').isDate(),
    body('line_items').isArray({ min: 1 })
  ],
  validateRequest,
  requireFoundationAccess,
  FinancialController.createInvoice
);

// Bank accounts
router.get('/bank-accounts',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  FinancialController.getBankAccounts
);

router.post('/bank-accounts',
  [
    body('foundation_id').isUUID(),
    body('account_name').trim().isLength({ min: 2 }),
    body('bank_name').trim().isLength({ min: 2 }),
    body('account_number').trim().isLength({ min: 5 }),
    body('currency').isIn(['SEK', 'EUR', 'USD']),
    body('account_type').isIn(['checking', 'savings', 'business'])
  ],
  validateRequest,
  requireFoundationAccess,
  FinancialController.createBankAccount
);

// Bank transactions
router.get('/bank-transactions',
  [
    query('bank_account_id').optional().isUUID(),
    query('is_reconciled').optional().isBoolean()
  ],
  validateRequest,
  FinancialController.getBankTransactions
);

router.post('/bank-transactions/sync',
  [body('bank_account_id').isUUID()],
  validateRequest,
  FinancialController.syncBankTransactions
);

router.post('/bank-transactions/:id/reconcile',
  [param('id').isUUID()],
  validateRequest,
  FinancialController.reconcileTransaction
);

// Financial reports
router.get('/reports',
  [
    query('foundation_id').optional().isUUID(),
    query('report_type').optional().isIn(['balance_sheet', 'income_statement', 'cash_flow', 'trial_balance', 'tax_report'])
  ],
  validateRequest,
  FinancialController.getFinancialReports
);

router.post('/reports',
  [
    body('foundation_id').isUUID(),
    body('report_type').isIn(['balance_sheet', 'income_statement', 'cash_flow', 'trial_balance', 'tax_report']),
    body('period_start').isDate(),
    body('period_end').isDate()
  ],
  validateRequest,
  requireFoundationAccess,
  FinancialController.generateFinancialReport
);

export default router;