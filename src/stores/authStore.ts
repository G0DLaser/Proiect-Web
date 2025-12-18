import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearMessages: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  successMessage: null,

  initialize: async () => {
    // Set up auth state listener FIRST
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    // THEN check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });
  },

  signUp: async (email: string, password: string) => {
    set({ error: null, successMessage: null, loading: true });
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      set({ error: error.message, loading: false });
      return false;
    }

    set({ 
      successMessage: 'Account created! Please sign in.',
      loading: false 
    });
    return true;
  },

  signIn: async (email: string, password: string) => {
    set({ error: null, successMessage: null, loading: true });
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return false;
    }

    set({ loading: false });
    return true;
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  clearMessages: () => {
    set({ error: null, successMessage: null });
  },
}));
