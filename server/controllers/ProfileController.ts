import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProfileController {
  static getCurrentProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw createError('Profile not found', 404);
    }

    res.json({ profile });
  });

  static updateCurrentProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { full_name, avatar_url } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  });

  static uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      throw createError('No file uploaded', 400);
    }

    // Upload avatar to Supabase Storage
    const fileName = `${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      throw createError('Avatar upload failed', 500);
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw createError(updateError.message, 400);
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: publicUrl.publicUrl,
      profile
    });
  });

  static getProfileById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, created_at')
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Profile not found', 404);
    }

    res.json({ profile });
  });

  static searchProfiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { query } = req.params;

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      profiles: profiles || [],
      total: profiles?.length || 0
    });
  });
}