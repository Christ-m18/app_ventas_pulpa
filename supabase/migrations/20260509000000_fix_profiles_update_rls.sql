-- ============================================================================
-- FIX: profiles_update_own RLS policy
-- ============================================================================
-- The original WITH CHECK clause used a subquery on the same `profiles` table
-- to verify the role wasn't being changed. This creates a circular RLS
-- dependency that blocks all profile updates.
--
-- Fix: Users can update their own row, but CANNOT change the `role` column.
-- We enforce this with a trigger instead of a RLS subquery.
-- ============================================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Simpler policy: user can update their own row
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger to prevent role changes by non-service-role users
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If the role is being changed and the caller is not service_role, block it
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
            NEW.role := OLD.role; -- silently revert role change
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON profiles;
CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();
