import express from 'express';
import { body, param, query } from 'express-validator';
import { GovernanceController } from '../controllers/GovernanceController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Role management
router.get('/roles',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  GovernanceController.getRoles
);

router.post('/roles',
  [
    body('foundation_id').isUUID(),
    body('name').trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('permissions').isArray()
  ],
  validateRequest,
  requireFoundationAccess,
  GovernanceController.createRole
);

// Document workflows
router.get('/workflows',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  GovernanceController.getDocumentWorkflows
);

router.post('/workflows',
  [
    body('document_id').isUUID(),
    body('workflow_type').isIn(['approval', 'review', 'signature']),
    body('steps').isArray({ min: 1 })
  ],
  validateRequest,
  GovernanceController.createDocumentWorkflow
);

router.post('/workflows/:id/action',
  [
    param('id').isUUID(),
    body('step_id').isUUID(),
    body('action').isIn(['approve', 'reject', 'sign']),
    body('comments').optional().trim()
  ],
  validateRequest,
  GovernanceController.processWorkflowAction
);

// Compliance tracking
router.get('/compliance',
  [query('foundation_id').optional().isUUID()],
  validateRequest,
  GovernanceController.getComplianceItems
);

router.post('/compliance',
  [
    body('foundation_id').isUUID(),
    body('regulation_type').isIn(['lansstyrelsen', 'skatteverket', 'bolagsverket', 'other']),
    body('title').trim().isLength({ min: 2 }),
    body('description').trim().isLength({ min: 10 }),
    body('due_date').isDate(),
    body('priority').isIn(['low', 'medium', 'high', 'critical']),
    body('assigned_to').isUUID()
  ],
  validateRequest,
  requireFoundationAccess,
  GovernanceController.createComplianceItem
);

// Audit logs
router.get('/audit-logs',
  [
    query('foundation_id').optional().isUUID(),
    query('action').optional().trim(),
    query('target_table').optional().trim()
  ],
  validateRequest,
  GovernanceController.getAuditLogs
);

export default router;