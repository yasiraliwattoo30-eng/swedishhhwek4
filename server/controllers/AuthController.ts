import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    });

    if (authError) {
      throw createError(authError.message, 400);
    }

    if (!authData.user) {
      throw createError('Failed to create user', 500);
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw createError('Failed to create user profile', 500);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw createError('Invalid credentials', 401);
    }

    if (!data.user || !data.session) {
      throw createError('Login failed', 401);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role_id,
          roles(name, description)
        )
      `)
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw createError('User profile not found', 404);
    }

    // Get user's primary role
    const userRoles = profile.user_roles || [];
    const primaryRole = userRoles.length > 0 ? userRoles[0].roles.name : profile.role || 'member';

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: primaryRole,
        roles: userRoles.map((ur: any) => ur.roles.name)
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }

    res.json({ message: 'Logout successful' });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw createError('Refresh token is required', 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      throw createError('Invalid refresh token', 401);
    }

    res.json({
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    });
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Password reset email sent' });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Password reset successful' });
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Email verified successfully' });
  });
}