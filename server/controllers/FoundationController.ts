import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class FoundationController {
  static getUserFoundations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    const { data: foundations, error } = await supabase
      .from('foundations')
      .select(`
        *,
        foundation_members!inner(role, permissions)
      `)
      .eq('foundation_members.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      foundations: foundations || [],
      total: foundations?.length || 0
    });
  });

  static getFoundationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: foundation, error } = await supabase
      .from('foundations')
      .select(`
        *,
        foundation_members(
          user_id,
          role,
          permissions,
          joined_at,
          profiles(full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Foundation not found', 404);
    }

    res.json({ foundation });
  });

  static createFoundation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, registration_number, description, address, phone, website } = req.body;

    // Create foundation
    const { data: foundation, error: foundationError } = await supabase
      .from('foundations')
      .insert({
        name,
        registration_number,
        description,
        address,
        phone,
        website,
        owner_user_id: userId,
        status: 'pending_verification',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (foundationError) {
      throw createError(foundationError.message, 400);
    }

    res.status(201).json({
      message: 'Foundation created successfully',
      foundation
    });
  });

  static updateFoundation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, description, address, phone, website } = req.body;

    const { data: foundation, error } = await supabase
      .from('foundations')
      .update({
        name,
        description,
        address,
        phone,
        website,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Foundation updated successfully',
      foundation
    });
  });

  static deleteFoundation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('foundations')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Foundation deleted successfully' });
  });

  static getFoundationMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: members, error } = await supabase
      .from('foundation_members')
      .select(`
        *,
        profiles(full_name, email, avatar_url)
      `)
      .eq('foundation_id', id)
      .order('joined_at', { ascending: true });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({ members: members || [] });
  });

  static addFoundationMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { user_id, role, permissions } = req.body;

    const { data: member, error } = await supabase
      .from('foundation_members')
      .insert({
        foundation_id: id,
        user_id,
        role,
        permissions: permissions || {},
        invited_by: req.user?.id,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles(full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Member added successfully',
      member
    });
  });

  static updateFoundationMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id, userId } = req.params;
    const { role, permissions } = req.body;

    const { data: member, error } = await supabase
      .from('foundation_members')
      .update({
        role,
        permissions: permissions || {}
      })
      .eq('foundation_id', id)
      .eq('user_id', userId)
      .select(`
        *,
        profiles(full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Member updated successfully',
      member
    });
  });

  static removeFoundationMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id, userId } = req.params;

    const { error } = await supabase
      .from('foundation_members')
      .delete()
      .eq('foundation_id', id)
      .eq('user_id', userId);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Member removed successfully' });
  });
}