import express from 'express';
import { body, param, query } from 'express-validator';
import { MeetingController } from '../controllers/MeetingController';
import { validateRequest } from '../middleware/validation';
import { requireFoundationAccess } from '../middleware/auth';

const router = express.Router();

// Get meetings with filters
router.get('/',
  [
    query('foundation_id').optional().isUUID(),
    query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    query('meeting_type').optional().isIn(['board_meeting', 'general_assembly', 'committee_meeting', 'other'])
  ],
  validateRequest,
  MeetingController.getMeetings
);

// Get meeting by ID
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  MeetingController.getMeetingById
);

// Create new meeting
router.post('/',
  [
    body('foundation_id').isUUID(),
    body('title').trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('location').optional().trim(),
    body('meeting_type').isIn(['board_meeting', 'general_assembly', 'committee_meeting', 'other']),
    body('attendees').optional().isArray()
  ],
  validateRequest,
  requireFoundationAccess,
  MeetingController.createMeeting
);

// Update meeting
router.put('/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    body('location').optional().trim(),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    body('attendees').optional().isArray()
  ],
  validateRequest,
  MeetingController.updateMeeting
);

// Delete meeting
router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  MeetingController.deleteMeeting
);

// Get meeting minutes
router.get('/:id/minutes',
  [param('id').isUUID()],
  validateRequest,
  MeetingController.getMeetingMinutes
);

// Create/update meeting minutes
router.post('/:id/minutes',
  [
    param('id').isUUID(),
    body('content').trim().isLength({ min: 10 }),
    body('attendees_present').optional().isArray(),
    body('decisions_made').optional().isArray(),
    body('action_items').optional().isArray()
  ],
  validateRequest,
  MeetingController.createMeetingMinutes
);

export default router;