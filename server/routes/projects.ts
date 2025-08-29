import express from 'express';
import { body, param, query } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Get projects with filters
router.get('/',
  [
    query('foundation_id').optional().isUUID(),
    query('status').optional().isIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'])
  ],
  validateRequest,
  ProjectController.getProjects
);

// Get project by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  ProjectController.getProjectById
);

// Create new project
router.post('/',
  [
    body('foundation_id').isUUID(),
    body('name').trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('status').optional().isIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']),
    body('start_date').optional().isDate(),
    body('end_date').optional().isDate(),
    body('budget').optional().isFloat({ min: 0 }),
    body('project_manager_id').optional().isUUID()
  ],
  validateRequest,
  requireFoundationAccess,
  ProjectController.createProject
);

// Update project
router.put('/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('status').optional().isIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']),
    body('start_date').optional().isDate(),
    body('end_date').optional().isDate(),
    body('budget').optional().isFloat({ min: 0 }),
    body('progress_percentage').optional().isInt({ min: 0, max: 100 }),
    body('project_manager_id').optional().isUUID()
  ],
  validateRequest,
  ProjectController.updateProject
);

// Delete project
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  ProjectController.deleteProject
);

// Update project progress
router.post('/:id/progress',
  [
    param('id').isUUID(),
    body('progress_percentage').isInt({ min: 0, max: 100 })
  ],
  validateRequest,
  ProjectController.updateProjectProgress
);

export default router;