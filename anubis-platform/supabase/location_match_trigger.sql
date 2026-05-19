-- ============================================================
-- ANUBIS — Location Match Trigger
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Required extensions (earthdistance depends on cube)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Location matches table (idempotent)
CREATE TABLE IF NOT EXISTS public.location_matches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gravesite_id_1  UUID        NOT NULL REFERENCES public.gravesite_profiles(id) ON DELETE CASCADE,
  gravesite_id_2  UUID        NOT NULL REFERENCES public.gravesite_profiles(id) ON DELETE CASCADE,
  distance_meters NUMERIC(10,1) NOT NULL,
  notified_user_1 BOOLEAN     NOT NULL DEFAULT false,
  notified_user_2 BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Canonical ordering: gravesite_id_1 < gravesite_id_2 (text comparison on UUID)
  -- This ensures (A,B) and (B,A) are always stored as the same row.
  CONSTRAINT unique_gravesite_pair UNIQUE (gravesite_id_1, gravesite_id_2),
  CONSTRAINT canonical_order CHECK (gravesite_id_1 < gravesite_id_2)
);

ALTER TABLE public.location_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own location matches"
  ON public.location_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gravesite_profiles gp
      WHERE gp.id IN (gravesite_id_1, gravesite_id_2)
        AND gp.user_id = auth.uid()
    )
  );

-- ============================================================
-- Function: finds nearby gravesites and creates match notifications
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_and_notify_location_matches()
RETURNS TRIGGER AS $$
DECLARE
  match           RECORD;
  threshold_meters CONSTANT INTEGER := 500;
  pair_id_1       UUID;
  pair_id_2       UUID;
BEGIN
  -- Only run when coordinates are present
  IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find other gravesites within threshold distance
  FOR match IN
    SELECT
      gp.id            AS gravesite_id,
      gp.user_id       AS owner_id,
      gp.deceased_name,
      ROUND(
        earth_distance(
          ll_to_earth(NEW.latitude::float8, NEW.longitude::float8),
          ll_to_earth(gp.latitude::float8,  gp.longitude::float8)
        )::numeric, 1
      ) AS distance_m
    FROM public.gravesite_profiles gp
    WHERE
      gp.id          != NEW.id
      AND gp.user_id != NEW.user_id
      AND gp.latitude  IS NOT NULL
      AND gp.longitude IS NOT NULL
      AND earth_distance(
            ll_to_earth(NEW.latitude::float8, NEW.longitude::float8),
            ll_to_earth(gp.latitude::float8,  gp.longitude::float8)
          ) <= threshold_meters
  LOOP
    -- Store pairs in canonical order (smaller UUID first) so (A,B) and (B,A)
    -- always map to the same row and the unique constraint fires correctly.
    IF NEW.id < match.gravesite_id THEN
      pair_id_1 := NEW.id;
      pair_id_2 := match.gravesite_id;
    ELSE
      pair_id_1 := match.gravesite_id;
      pair_id_2 := NEW.id;
    END IF;

    INSERT INTO public.location_matches
      (gravesite_id_1, gravesite_id_2, distance_meters, notified_user_1, notified_user_2)
    VALUES
      (pair_id_1, pair_id_2, match.distance_m, true, true)
    ON CONFLICT (gravesite_id_1, gravesite_id_2) DO NOTHING;

    -- Only notify if the insert actually happened (FOUND = false on conflict)
    IF FOUND THEN
      -- Notify the owner of the new/updated gravesite.
      -- Embed matched_owner_id so the app never needs a secondary RLS-filtered
      -- query to resolve the owner from gravesite_profiles.
      INSERT INTO public.notifications
        (user_id, type, title, message, data)
      VALUES (
        NEW.user_id,
        'location_match',
        'Nearby Memorial Discovered',
        'A memorial for ' || match.deceased_name || ' was found ' ||
          match.distance_m || 'm from one of your gravesites.',
        jsonb_build_object(
          'matched_gravesite_id', match.gravesite_id,
          'matched_owner_id',     match.owner_id,
          'your_gravesite_id',    NEW.id,
          'distance_meters',      match.distance_m
        )
      );

      -- Notify the owner of the matched gravesite
      INSERT INTO public.notifications
        (user_id, type, title, message, data)
      VALUES (
        match.owner_id,
        'location_match',
        'Nearby Memorial Discovered',
        'A memorial for ' || NEW.deceased_name || ' was found ' ||
          match.distance_m || 'm from one of your gravesites.',
        jsonb_build_object(
          'matched_gravesite_id', NEW.id,
          'matched_owner_id',     NEW.user_id,
          'your_gravesite_id',    match.gravesite_id,
          'distance_meters',      match.distance_m
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after insert or coordinate update
DROP TRIGGER IF EXISTS on_gravesite_coordinates_changed ON public.gravesite_profiles;

CREATE TRIGGER on_gravesite_coordinates_changed
  AFTER INSERT OR UPDATE OF latitude, longitude
  ON public.gravesite_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.find_and_notify_location_matches();
