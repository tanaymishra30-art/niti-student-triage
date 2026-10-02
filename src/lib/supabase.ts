/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get saved credentials or fallback to env variables
export function getSavedSupabaseConfig(): SupabaseConfig | null {
  try {
    const saved = localStorage.getItem('niti_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.warn('Error reading Supabase credentials:', e);
  }

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('xyzcompany')) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config) return null;

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
    const client = createClient(url, anonKey);
    const { error } = await client.from('tasks').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message || 'Could not connect to database table.' };
    }
    return { success: true, message: 'Supabase Database Connection Successful!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection error.' };
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
