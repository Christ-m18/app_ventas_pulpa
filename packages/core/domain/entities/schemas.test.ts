import { describe, it, expect } from 'vitest';
import { ProductSchema } from './product';
import {
  CheckoutFormSchema,
  DELIVERY_ZONES,
} from './order';

// ─── Product Schema Tests ──────────────────────────────────────

describe('Product Zod Schemas', () => {
  const validProduct = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Pulpa de Mango',
    description: null,
    price: 150,
    stock: 50,
    unit: 'lb',
    image_url: null,
    category_id: null,
    is_combo: false,
    is_featured: true,
    benefits: ['Vitamina A'],
    created_at: '2025-01-01T00:00:00+00:00',
    updated_at: '2025-01-01T00:00:00+00:00',
  };

  it('should validate a correct product', () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject a product with negative price', () => {
    const result = ProductSchema.safeParse({ ...validProduct, price: -10 });
    expect(result.success).toBe(false);
  });

  it('should reject a product with negative stock', () => {
    const result = ProductSchema.safeParse({ ...validProduct, stock: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid unit values', () => {
    const result = ProductSchema.safeParse({ ...validProduct, unit: 'gallon' });
    expect(result.success).toBe(false);
  });

  it('should reject empty product name', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
  });
});

// ─── Checkout Form Schema Tests ────────────────────────────────

describe('CheckoutForm Zod Schema', () => {
  const validForm = {
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '8091234567',
    address: 'Calle Principal #123, Ensanche Naco',
    zone: 'distrito-nacional',
    paymentMethod: 'cash_on_delivery',
    notes: 'Dejar en la puerta',
  };

  it('should validate a correct checkout form', () => {
    const result = CheckoutFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it('should reject short name', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, fullName: 'AB' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject short phone number', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('should reject phone with injection characters', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, phone: "'; DROP TABLE--" });
    expect(result.success).toBe(false);
  });

  it('should reject short address', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, address: 'Short' });
    expect(result.success).toBe(false);
  });

  it('should reject empty zone', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, zone: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment method', () => {
    const result = CheckoutFormSchema.safeParse({ ...validForm, paymentMethod: 'bitcoin' });
    expect(result.success).toBe(false);
  });

  it('should accept missing optional notes', () => {
    const formWithoutNotes = { ...validForm, notes: undefined };
    const result = CheckoutFormSchema.safeParse(formWithoutNotes);
    expect(result.success).toBe(true);
  });

  it('should reject notes longer than 500 chars', () => {
    const result = CheckoutFormSchema.safeParse({
      ...validForm,
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Delivery Zones Tests ──────────────────────────────────────

describe('Delivery Zones', () => {
  it('should have at least one zone', () => {
    expect(DELIVERY_ZONES.length).toBeGreaterThan(0);
  });

  it('should have unique IDs', () => {
    const ids = DELIVERY_ZONES.map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have non-negative costs', () => {
    DELIVERY_ZONES.forEach((zone) => {
      expect(zone.cost).toBeGreaterThanOrEqual(0);
    });
  });
});
