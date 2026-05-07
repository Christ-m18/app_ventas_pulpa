-- ============================================================================
-- VOUCHER TO ORDER STATUS SYNC TRIGGER
-- ============================================================================
-- Keeps the orders.payment_status in sync with payment_vouchers.is_verified.
-- This ensures that when an administrator manually checks the "is_verified" 
-- box in the Supabase Dashboard, the related order is updated automatically.

CREATE OR REPLACE FUNCTION sync_payment_voucher_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If voucher was manually verified
    IF NEW.is_verified = true AND (TG_OP = 'INSERT' OR OLD.is_verified = false) THEN
        UPDATE orders
        SET payment_status = 'verified'
        WHERE id = NEW.order_id;
    END IF;
    
    -- If voucher verification was manually revoked
    IF TG_OP = 'UPDATE' AND NEW.is_verified = false AND OLD.is_verified = true THEN
        UPDATE orders
        SET payment_status = 'pending_review'
        WHERE id = NEW.order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_voucher_status ON payment_vouchers;
CREATE TRIGGER trigger_sync_voucher_status
AFTER INSERT OR UPDATE OF is_verified ON payment_vouchers
FOR EACH ROW
EXECUTE FUNCTION sync_payment_voucher_status();
