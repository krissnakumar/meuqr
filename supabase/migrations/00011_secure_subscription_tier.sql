-- Migration to secure the subscription_tier column
-- Prevents clients from updating subscription_tier directly.

CREATE OR REPLACE FUNCTION public.prevent_subscription_tier_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if the subscription_tier is actually being changed
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    -- If the current role is authenticated or anon (i.e. a client request)
    -- service_role bypassing RLS will bypass this if we check role, or we can just check role.
    IF current_user IN ('authenticated', 'anon', 'authenticator') THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify subscription_tier directly from the client.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_secure_subscription_tier ON public.businesses;
CREATE TRIGGER tr_secure_subscription_tier
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_tier_update();
