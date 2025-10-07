-- Purchases Table Migration
-- Track customer purchases from Shopify
-- This table stores order data and links users to their purchased products/bundles

-- =====================================================
-- PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shopify_order_id TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL, -- 'bundle' | 'starter' | 'complete' | 'maximum' | 'individual'
  product_name TEXT NOT NULL,
  apps_included TEXT[] NOT NULL DEFAULT '{}', -- Array of app slugs (e.g., ['testograph-pro', 'meal-planner', 'sleep-tracker'])
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  status TEXT DEFAULT 'completed', -- 'completed' | 'refunded' | 'expired'
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For subscription model (if needed in future)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_shopify_order_id ON public.purchases(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON public.purchases(purchased_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can only view their own purchases
CREATE POLICY "Users can view own purchases"
    ON public.purchases
    FOR SELECT
    USING (auth.uid() = user_id);

-- Authenticated users (admins) can view all purchases
CREATE POLICY "Authenticated users can view all purchases"
    ON public.purchases
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can insert/update purchases (via webhooks)
-- No policy needed - service role bypasses RLS

-- =====================================================
-- TRIGGER: AUTO-UPDATE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_purchases_updated_at();

-- =====================================================
-- TRIGGER: UPDATE USER TOTAL_SPENT
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profiles.total_spent when new purchase is added
    UPDATE public.profiles
    SET total_spent = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.purchases
        WHERE user_id = NEW.user_id
        AND status = 'completed'
    )
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_total_spent
    AFTER INSERT OR UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_user_total_spent();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.purchases IS 'Stores customer purchase data from Shopify orders';
COMMENT ON COLUMN public.purchases.user_id IS 'References auth.users - the customer who made the purchase';
COMMENT ON COLUMN public.purchases.shopify_order_id IS 'Unique Shopify order ID for idempotency';
COMMENT ON COLUMN public.purchases.product_type IS 'Type of product: bundle, starter, complete, maximum, or individual';
COMMENT ON COLUMN public.purchases.apps_included IS 'Array of app slugs that user has access to (e.g., [testograph-pro, meal-planner])';
COMMENT ON COLUMN public.purchases.amount IS 'Purchase amount in the specified currency';
COMMENT ON COLUMN public.purchases.status IS 'Order status: completed, refunded, or expired';
COMMENT ON COLUMN public.purchases.purchased_at IS 'Timestamp when order was completed in Shopify';
COMMENT ON COLUMN public.purchases.expires_at IS 'Optional expiration date for subscription-based products';
