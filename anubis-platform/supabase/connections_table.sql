-- ============================================================
-- ANUBIS — Connections Table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.connections (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate pairs in either direction
  UNIQUE (requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Both parties can read the connection
CREATE POLICY "Users can view their own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Only the requester can create a request
CREATE POLICY "Users can send connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Only the recipient can update status (accept / decline)
CREATE POLICY "Recipients can respond to connection requests"
  ON public.connections FOR UPDATE
  USING (auth.uid() = recipient_id);
