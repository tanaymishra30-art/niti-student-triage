-- ========================================================
-- NITI: STUDENT TRIAGE ENGINE - SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  college TEXT,
  target_bedtime TEXT DEFAULT '23:30',
  dinner_duration_minutes INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  duration INT NOT NULL DEFAULT 45,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  dropped_tonight BOOLEAN DEFAULT FALSE,
  condensed BOOLEAN DEFAULT FALSE,
  original_duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LECTURES TABLE
CREATE TABLE IF NOT EXISTS public.lectures (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 90,
  status TEXT NOT NULL CHECK (status IN ('attended', 'skipped')),
  focus_rating INT NOT NULL CHECK (focus_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRANSIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.transit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('idle', 'in_transit', 'triaged')),
  left_college_time BIGINT,
  home_time BIGINT,
  commute_duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks Policies
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = id);

-- Lectures Policies
CREATE POLICY "Users can manage own lectures" ON public.lectures FOR ALL USING (auth.uid() = id);

-- Transit Logs Policies
CREATE POLICY "Users can manage own transit logs" ON public.transit_logs FOR ALL USING (auth.uid() = id);
