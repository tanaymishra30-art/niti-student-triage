/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, UserProfile } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_URL = 'https://vewtmabrozwmwdtxgbnn.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_RZFhT7G4IjvKz6PoofQy4Q_V9UanVi7';

export function sanitizeSupabaseUrl(url: string): string {
  if (!url) return DEFAULT_SUPABASE_URL;
  let cleaned = url.trim();
  // Strip trailing /rest/v1/ or /rest/v1
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

// Get saved credentials or fallback to hardcoded user project credentials
export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem('niti_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: sanitizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch (e) {
    console.warn('Error reading saved Supabase credentials:', e);
  }

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('xyzcompany')) {
    return { url: sanitizeSupabaseUrl(envUrl), anonKey: envKey.trim() };
  }

  // Hardcoded default connection credentials
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config || !config.url || !config.anonKey) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// Test live Supabase connection
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const client = createClient(cleanUrl, anonKey);
    const { error } = await client.from('tasks').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return { success: false, message: error.message || 'Could not connect to database table.' };
    }
    return { success: true, message: 'Supabase Database Connection Successful!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection error.' };
  }
}

// Registered User & Unique Email Helpers
export interface SupabaseDbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'student';
}

export async function fetchSupabaseUserByEmail(email: string): Promise<SupabaseDbUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const emailLower = email.trim().toLowerCase();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role || 'student',
    };
  } catch (e) {
    return null;
  }
}

export async function registerSupabaseUser(user: SupabaseDbUser): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('users').upsert({
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
      password: user.password,
      role: user.role,
    });
    if (error) {
      console.warn('Error registering user to Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Exception registering user to Supabase:', e);
    return false;
  }
}

export async function fetchAllSupabaseUsers(): Promise<Record<string, { password: string; name: string; college: string; role: 'admin' | 'student' }> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('users').select('*');
    if (error || !data) return null;

    const map: Record<string, { password: string; name: string; college: string; role: 'admin' | 'student' }> = {};
    data.forEach((u: any) => {
      map[u.email.toLowerCase()] = {
        password: u.password,
        name: u.name,
        college: 'Engineering Institute',
        role: u.role || 'student',
      };
    });
    return map;
  } catch (e) {
    return null;
  }
}

// User Profile Sync Helpers
export async function syncUserProfileToSupabase(email: string, profile: UserProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('profiles').upsert({
      email: email.toLowerCase(),
      name: profile.name,
      target_bedtime: profile.targetBedtime,
      commute_time_mins: profile.commuteTimeMins,
      decompression_buffer_mins: profile.decompressionBufferMins,
      weekly_timetable: profile.weeklyTimetable,
      has_onboarded: profile.hasOnboarded,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (e) {
    return false;
  }
}

export async function fetchUserProfileFromSupabase(email: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !data) return null;

    return {
      name: data.name,
      targetBedtime: data.target_bedtime || '23:30',
      commuteTimeMins: data.commute_time_mins || 45,
      decompressionBufferMins: data.decompression_buffer_mins || 30,
      weeklyTimetable: data.weekly_timetable || [],
      hasOnboarded: Boolean(data.has_onboarded),
      onboardedAt: new Date(data.updated_at || Date.now()).getTime(),
    };
  } catch (e) {
    return null;
  }
}

// Data Sync Helpers
export async function syncTasksToSupabase(tasks: Task[], userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const formatted = tasks.map((t) => ({
      id: t.id,
      user_id: userId || null,
      title: t.title,
      subject: t.subject || 'General',
      duration: t.duration,
      priority: t.priority,
      completed: t.completed,
      dropped_tonight: Boolean(t.droppedTonight),
      condensed: Boolean(t.condensed),
      original_duration: t.originalDuration || null,
    }));

    const { error } = await client.from('tasks').upsert(formatted);
    if (error) console.warn('Supabase task sync error:', error);
    return !error;
  } catch (err) {
    console.warn('Supabase sync exception:', err);
    return false;
  }
}

export async function fetchTasksFromSupabase(): Promise<Task[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('tasks').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      subject: t.subject || 'General',
      duration: t.duration,
      priority: t.priority,
      completed: t.completed,
      droppedTonight: t.dropped_tonight,
      condensed: t.condensed,
      originalDuration: t.original_duration,
      createdAt: new Date(t.created_at || Date.now()).getTime(),
    }));
  } catch (e) {
    return null;
  }
}
