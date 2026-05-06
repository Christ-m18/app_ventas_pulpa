-- ============================================================================
-- HARDENED ROW LEVEL SECURITY POLICIES
-- Security Level: Bancario / Enterprise
-- ============================================================================
-- This migration replaces the original permissive RLS with strict policies.
-- No public write access. All mutations require authenticated JWT + uid match.
-- ============================================================================

-- ─── Drop existing policies ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public read access for categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access for products" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view items from their own orders" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admin can view inventory logs" ON inventory_logs;

-- ─── CATEGORIES: Public Read, No Write ─────────────────────────────────────

-- Anyone can read categories (including anonymous/unauthenticated)
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- Only service_role or future admin role can write
CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

-- ─── PRODUCTS: Public Read, Admin Write ────────────────────────────────────

CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

-- ─── ORDERS: Authenticated + Owner Only ────────────────────────────────────

-- Users can only see their own orders
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
  );

-- Users can only create orders for themselves
CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
  );

-- Users CANNOT update their own orders (only admin/service_role can)
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

-- No order deletion for anyone except service_role
CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

-- ─── ORDER ITEMS: Authenticated + Owner via Order ──────────────────────────

CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "order_items_insert_own"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- No update/delete for order items
CREATE POLICY "order_items_update_deny"
  ON order_items FOR UPDATE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "order_items_delete_deny"
  ON order_items FOR DELETE
  USING (
    (SELECT auth.role()) = 'service_role'
  );

-- ─── INVENTORY LOGS: Service Role Only ─────────────────────────────────────

CREATE POLICY "inventory_logs_select_admin"
  ON inventory_logs FOR SELECT
  USING (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "inventory_logs_insert_system"
  ON inventory_logs FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "inventory_logs_update_deny"
  ON inventory_logs FOR UPDATE
  USING (false);

CREATE POLICY "inventory_logs_delete_deny"
  ON inventory_logs FOR DELETE
  USING (false);
