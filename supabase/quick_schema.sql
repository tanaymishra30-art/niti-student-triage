-- ========================================================
-- NITI: QUICK SUPABASE TABLE CREATION SCRIPT
-- Paste this script directly in Supabase SQL Editor & click RUN!
-- ========================================================

-- 1. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  duration INT NOT NULL DEFAULT 45,
  priority TEXT NOT NULL DEFAULT 'P1',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  dropped_tonight BOOLEAN DEFAULT FALSE,
  condensed BOOLEAN DEFAULT FALSE,
  original_duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Lectures Table
CREATE TABLE IF NOT EXISTS public.lectures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'attended',
  focus_rating INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Transit State Table
CREATE TABLE IF NOT EXISTS public.transit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'idle',
  left_college_time BIGINT,
  home_time BIGINT,
  commute_duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Public Access for Web Application
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_logs DISABLE ROW LEVEL SECURITY;
