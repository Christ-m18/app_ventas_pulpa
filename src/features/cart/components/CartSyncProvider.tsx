"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { productService } from "@/features/products/services/productService";
import type { CartItem, Product } from "../../../../packages/core/domain/entities/product";

type CloudLine = { product_id: string; quantity: number };

async function fetchCloudCart(): Promise<CloudLine[]> {
  try {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.items) ? (json.items as CloudLine[]) : [];
  } catch {
    return [];
  }
}

async function pushCloudCart(items: CartItem[]): Promise<boolean> {
  try {
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      }),
    });
    // 503 = server not configured (missing SERVICE_ROLE_KEY or migration).
    // Any non-2xx means cloud sync isn't usable right now. Stop retrying.
    if (!res.ok) return false;
    return true;
  } catch {
    // Network failure — disable for this session.
    return false;
  }
}

function mergeCarts(local: CartItem[], cloud: CloudLine[], catalog: Product[]): CartItem[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const merged = new Map<string, CartItem>();

  for (const it of local) {
    merged.set(it.product.id, { product: it.product, quantity: it.quantity });
  }
  for (const line of cloud) {
    const product = byId.get(line.product_id);
    if (!product) continue;
    const existing = merged.get(line.product_id);
    if (existing) {
      // Take the larger quantity to preserve user intent across devices.
      existing.quantity = Math.max(existing.quantity, line.quantity);
    } else {
      merged.set(line.product_id, { product, quantity: line.quantity });
    }
  }
  return Array.from(merged.values());
}

/**
 * Syncs the Zustand cart with Supabase whenever the auth state changes.
 * - On sign-in: fetch cloud cart, merge with local, push merged back.
 * - On local mutation while signed in: push (debounced) to cloud.
 * - On sign-out: clear local cart.
 */
export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useCartStore((s) => s.hydrated);
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const clearCart = useCartStore((s) => s.clearCart);

  const userIdRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);
  const cloudAvailableRef = useRef(true);

  // Subscribe to auth changes once.
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    async function syncAfterSignIn(userId: string) {
      // If cloud was already determined to be unavailable, skip.
      if (!cloudAvailableRef.current) return;
      if (syncingRef.current) return;

      syncingRef.current = true;
      const [cloud, products] = await Promise.all([
        fetchCloudCart(),
        productService.getProducts(),
      ]);
      if (cancelled) return;
      const merged = mergeCarts(useCartStore.getState().items, cloud, products);
      setItems(merged);
      const available = await pushCloudCart(merged);
      cloudAvailableRef.current = available;
      // Only enable debounced pushes if the cloud is available.
      userIdRef.current = available ? userId : null;
      syncingRef.current = false;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) void syncAfterSignIn(data.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void syncAfterSignIn(session.user.id);
      } else if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        clearCart();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [hydrated, setItems, clearCart]);

  // Debounced push on local item changes (only if signed in and not in initial sync).
  useEffect(() => {
    if (!hydrated) return;
    if (!userIdRef.current) return;
    if (syncingRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void pushCloudCart(items);
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [items, hydrated]);

  return <>{children}</>;
}
