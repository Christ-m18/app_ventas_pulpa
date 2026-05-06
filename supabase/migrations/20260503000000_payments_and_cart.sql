-- ============================================================================
-- PAYMENTS, VOUCHER VERIFICATION & CART SYNC
-- ============================================================================
-- Restricts payment methods to cash + transfer only. Adds infrastructure for
-- AI-validated bank-transfer vouchers and per-user cart persistence.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ─── PAYMENT METHOD ENUM: cash + transfer only ───────────────────────────────
-- Convert to text, drop old enum, recreate, re-apply mapping legacy values.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = 'payment_method'
          AND e.enumlabel IN ('stripe','paypal')
    ) THEN
        ALTER TABLE orders ALTER COLUMN payment_method DROP DEFAULT;
        ALTER TABLE orders ALTER COLUMN payment_method TYPE TEXT USING payment_method::text;
        DROP TYPE payment_method CASCADE;
        CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'bank_transfer');
        ALTER TABLE orders ALTER COLUMN payment_method TYPE payment_method USING (
            CASE
                WHEN payment_method IN ('stripe', 'paypal') THEN 'bank_transfer'::payment_method
                ELSE payment_method::payment_method
            END
        );
    END IF;
END
$$;

-- ─── PAYMENT_STATUS ENUM ─────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM (
            'awaiting_voucher',
            'pending_review',
            'verified',
            'pending_cash',
            'paid',
            'failed'
        );
    END IF;
END
$$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status;

UPDATE orders SET payment_status = CASE
    WHEN payment_method = 'cash_on_delivery' THEN 'pending_cash'::payment_status
    ELSE 'pending_review'::payment_status
END
WHERE payment_status IS NULL;

ALTER TABLE orders ALTER COLUMN payment_status SET NOT NULL;

-- ─── BANK ACCOUNTS (public read) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'corriente' CHECK (account_type IN ('corriente','ahorros')),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bank_accounts_select_public" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_write"   ON bank_accounts;

CREATE POLICY "bank_accounts_select_public"
    ON bank_accounts FOR SELECT
    USING (is_active = true);

CREATE POLICY "bank_accounts_admin_write"
    ON bank_accounts FOR ALL
    USING ((SELECT auth.role()) = 'service_role')
    WITH CHECK ((SELECT auth.role()) = 'service_role');

-- ─── PAYMENT VOUCHERS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    extracted JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    confidence NUMERIC(3,2),
    warnings TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vouchers_select_own"   ON payment_vouchers;
DROP POLICY IF EXISTS "vouchers_insert_admin" ON payment_vouchers;
DROP POLICY IF EXISTS "vouchers_update_admin" ON payment_vouchers;
DROP POLICY IF EXISTS "vouchers_delete_admin" ON payment_vouchers;

CREATE POLICY "vouchers_select_own"
    ON payment_vouchers FOR SELECT
    USING (
        (SELECT auth.uid()) = user_id
        OR (SELECT auth.role()) = 'service_role'
    );

CREATE POLICY "vouchers_insert_admin"
    ON payment_vouchers FOR INSERT
    WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "vouchers_update_admin"
    ON payment_vouchers FOR UPDATE
    USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "vouchers_delete_admin"
    ON payment_vouchers FOR DELETE
    USING ((SELECT auth.role()) = 'service_role');

-- ─── CART_ITEMS (per-user cart persistence) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_owner_all" ON cart_items;
CREATE POLICY "cart_items_owner_all"
    ON cart_items FOR ALL
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- touch_updated_at trigger function provided by 20260502120000_profiles_and_mfa.sql
DROP TRIGGER IF EXISTS cart_items_touch_updated_at ON cart_items;
CREATE TRIGGER cart_items_touch_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- ─── STORAGE BUCKET FOR VOUCHERS ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('vouchers', 'vouchers', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "vouchers_storage_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "vouchers_storage_admin_all"     ON storage.objects;

CREATE POLICY "vouchers_storage_owner_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'vouchers'
        AND (
            (SELECT auth.role()) = 'service_role'
            OR (storage.foldername(name))[1] = (SELECT auth.uid())::text
        )
    );

CREATE POLICY "vouchers_storage_admin_all"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'vouchers'
        AND (SELECT auth.role()) = 'service_role'
    )
    WITH CHECK (
        bucket_id = 'vouchers'
        AND (SELECT auth.role()) = 'service_role'
    );

-- ─── SEED DEFAULT BANK ACCOUNTS (only if table is empty) ─────────────────────

INSERT INTO bank_accounts (bank_name, account_holder, account_number, account_type, sort_order, is_active)
SELECT * FROM (VALUES
    ('Banreservas',    'D''Richard Pulpas y Frutas Al Natural', '0000-0000-0000', 'corriente', 1, true),
    ('Banco Popular',  'D''Richard Pulpas y Frutas Al Natural', '0000-0000-0000', 'corriente', 2, true),
    ('BHD',            'D''Richard Pulpas y Frutas Al Natural', '0000-0000-0000', 'ahorros',   3, true)
) AS seed(bank_name, account_holder, account_number, account_type, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM bank_accounts);
