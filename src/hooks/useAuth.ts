import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface AuthUser extends User {
  profile?: {
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setUser(authUser as AuthUser);
        return;
      }

      setUser({
        ...authUser,
        profile
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(authUser as AuthUser);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update local user state
    setUser(prev => prev ? {
      ...prev,
      profile: {
        ...prev.profile,
        ...updates
      }
    } : null);

    return data;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };
};