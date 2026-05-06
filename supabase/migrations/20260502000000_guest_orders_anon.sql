-- Guest checkout: web/mobile insert orders without auth.users (user_id stays NULL).
-- Existing policy requires auth.uid() = user_id, which blocks anon clients.

CREATE POLICY "Allow anon insert guest orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anon insert items for guest orders"
ON public.order_items
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id IS NULL
  )
);
