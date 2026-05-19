-- ============================================================
-- ANUBIS — Add public_id column to gravesite_media
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

ALTER TABLE public.gravesite_media
  ADD COLUMN IF NOT EXISTS public_id TEXT;
