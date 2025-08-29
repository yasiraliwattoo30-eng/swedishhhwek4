import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class MeetingController {
  static getMeetings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, status, meeting_type } = req.query;

    let query = supabase
      .from('meetings')
      .select(`
        *,
        foundations(name),
        profiles!meetings_organizer_id_fkey(full_name, email)
      `)
      .order('start_time', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (meeting_type) {
      query = query.eq('meeting_type', meeting_type);
    }

    const { data: meetings, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      meetings: meetings || [],
      total: meetings?.length || 0
    });
  });

  static getMeetingById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select(`
        *,
        foundations(name),
        profiles!meetings_organizer_id_fkey(full_name, email),
        meeting_minutes(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Meeting not found', 404);
    }

    res.json({ meeting });
  });

  static createMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      title,
      description,
      start_time,
      end_time,
      location,
      meeting_type,
      attendees
    } = req.body;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        foundation_id,
        organizer_id: req.user?.id,
        title,
        description,
        start_time,
        end_time,
        location,
        meeting_type,
        status: 'scheduled',
        attendees: attendees || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  });

  static updateMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      status,
      attendees
    } = req.body;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update({
        title,
        description,
        start_time,
        end_time,
        location,
        status,
        attendees,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
  });

  static deleteMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Meeting deleted successfully' });
  });

  static getMeetingMinutes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: minutes, error } = await supabase
      .from('meeting_minutes')
      .select(`
        *,
        profiles!meeting_minutes_created_by_fkey(full_name, email),
        meetings(title, start_time)
      `)
      .eq('meeting_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      minutes: minutes || [],
      total: minutes?.length || 0
    });
  });

  static createMeetingMinutes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      content,
      attendees_present,
      decisions_made,
      action_items
    } = req.body;

    const { data: minutes, error } = await supabase
      .from('meeting_minutes')
      .insert({
        meeting_id: id,
        content,
        attendees_present: attendees_present || [],
        decisions_made: decisions_made || [],
        action_items: action_items || [],
        created_by: req.user?.id,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Meeting minutes created successfully',
      minutes
    });
  });
}