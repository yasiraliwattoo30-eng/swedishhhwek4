import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class GrantController {
  static getGrants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { project_id, status } = req.query;

    let query = supabase
      .from('grants')
      .select(`
        *,
        projects(name, foundation_id, foundations(name))
      `)
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: grants, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      grants: grants || [],
      total: grants?.length || 0
    });
  });

  static getGrantById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: grant, error } = await supabase
      .from('grants')
      .select(`
        *,
        projects(name, foundation_id, foundations(name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Grant not found', 404);
    }

    res.json({ grant });
  });

  static createGrant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      project_id,
      grant_name,
      grantor_name,
      amount,
      currency,
      application_date,
      requirements,
      reporting_schedule,
      notes
    } = req.body;

    const { data: grant, error } = await supabase
      .from('grants')
      .insert({
        project_id,
        grant_name,
        grantor_name,
        amount: parseFloat(amount),
        currency,
        status: 'applied',
        application_date,
        requirements: requirements || [],
        reporting_schedule: reporting_schedule || [],
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Grant application created successfully',
      grant
    });
  });

  static updateGrant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      grant_name,
      grantor_name,
      amount,
      status,
      award_date,
      completion_date,
      notes
    } = req.body;

    const { data: grant, error } = await supabase
      .from('grants')
      .update({
        grant_name,
        grantor_name,
        amount: amount ? parseFloat(amount) : undefined,
        status,
        award_date,
        completion_date,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Grant updated successfully',
      grant
    });
  });

  static deleteGrant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('grants')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Grant deleted successfully' });
  });
}