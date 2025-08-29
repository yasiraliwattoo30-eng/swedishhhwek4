import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProjectController {
  static getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, status } = req.query;

    let query = supabase
      .from('projects')
      .select(`
        *,
        foundations(name),
        profiles!projects_project_manager_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      projects: projects || [],
      total: projects?.length || 0
    });
  });

  static getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        foundations(name),
        profiles!projects_project_manager_id_fkey(full_name, email),
        grants(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Project not found', 404);
    }

    res.json({ project });
  });

  static createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      name,
      description,
      status,
      start_date,
      end_date,
      budget,
      project_manager_id
    } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        foundation_id,
        name,
        description,
        status: status || 'planning',
        start_date,
        end_date,
        budget: budget ? parseFloat(budget) : null,
        project_manager_id,
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  });

  static updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      start_date,
      end_date,
      budget,
      progress_percentage,
      project_manager_id
    } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        status,
        start_date,
        end_date,
        budget: budget ? parseFloat(budget) : undefined,
        progress_percentage,
        project_manager_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  });

  static deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Project deleted successfully' });
  });

  static updateProjectProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { progress_percentage } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        progress_percentage: parseInt(progress_percentage),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Project progress updated successfully',
      project
    });
  });
}