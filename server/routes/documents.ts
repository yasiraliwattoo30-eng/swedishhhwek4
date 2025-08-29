import express from 'express';
import { body, param, query } from 'express-validator';
import { DocumentController } from '../controllers/DocumentController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Get documents with filters
router.get('/',
  [
    query('foundation_id').optional().isUUID(),
    query('document_type').optional().isIn(['articles_of_association', 'bylaws', 'financial_statement', 'board_resolution', 'other']),
    query('status').optional().isIn(['uploaded', 'pending_approval', 'approved', 'rejected'])
  ],
  validateRequest,
  DocumentController.getDocuments
);

// Get document by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  DocumentController.getDocumentById
);

// Upload new document
router.post('/',
  upload.single('document'),
  [
    body('foundation_id').isUUID(),
    body('document_type').isIn(['articles_of_association', 'bylaws', 'financial_statement', 'board_resolution', 'other']),
    body('notes').optional().trim()
  ],
  validateRequest,
  requireFoundationAccess,
  DocumentController.uploadDocument
);

// Update document
router.put('/:id',
  [
    param('id').isUUID(),
    body('status').optional().isIn(['uploaded', 'pending_approval', 'approved', 'rejected']),
    body('approval_notes').optional().trim()
  ],
  validateRequest,
  DocumentController.updateDocument
);

// Delete document
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  DocumentController.deleteDocument
);

// Download document
router.get('/:id/download',
  [param('id').isUUID()],
  validateRequest,
  DocumentController.downloadDocument
);

// Get document versions
router.get('/:id/versions',
  [param('id').isUUID()],
  validateRequest,
  DocumentController.getDocumentVersions
);

// Upload new document version
router.post('/:id/versions',
  upload.single('document'),
  [
    param('id').isUUID(),
    body('change_notes').optional().trim()
  ],
  validateRequest,
  DocumentController.uploadDocumentVersion
);

export default router;