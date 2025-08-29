import express from 'express';
import { query } from 'express-validator';
import { ReportController } from '../controllers/ReportController';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  ReportController.getDashboardAnalytics
);

// Get financial overview
router.get('/financial-overview',
  [
    query('foundation_id').optional().isUUID(),
    query('period_start').optional().isDate(),
    query('period_end').optional().isDate()
  ],
  validateRequest,
  ReportController.getFinancialOverview
);

// Get expense analytics
router.get('/expense-analytics',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  ReportController.getExpenseAnalytics
);

// Get investment analytics
router.get('/investment-analytics',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  ReportController.getInvestmentAnalytics
);

// Get project analytics
router.get('/project-analytics',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  ReportController.getProjectAnalytics
);

// Get compliance analytics
router.get('/compliance-analytics',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  ReportController.getComplianceAnalytics
);

// Export reports
router.post('/export',
  [
    query('foundation_id').optional().isUUID(),
    query('report_type').isIn(['financial', 'compliance', 'governance', 'complete']),
    query('format').optional().isIn(['pdf', 'excel', 'csv'])
  ],
  validateRequest,
  ReportController.exportReport
);

export default router;