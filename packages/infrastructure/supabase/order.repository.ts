/**
 * Supabase Order Repository — Infrastructure implementation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IOrderRepository,
  CreateOrderInput,
} from '../../core/domain/repositories/order.repository';
import type { Order, OrderItem } from '../../core/domain/entities/order';
import { calculateCartTotal } from '../../core/use-cases/cart.use-cases';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateOrderInput): Promise<Order> {
    const subtotal = calculateCartTotal(input.items);
    const total = subtotal + input.shippingCost;

    // Create order
    const { data: order, error: orderError } = await this.client
      .from('orders')
      .insert({
        user_id: input.userId,
        total,
        status: 'pending',
        payment_method: input.formData.paymentMethod,
        delivery_address: input.formData.address,
        zone: input.formData.zone,
        shipping_cost: input.shippingCost,
        phone: input.formData.phone,
        notes: input.formData.notes ?? null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[SupabaseOrderRepo] create error:', orderError.message);
      throw new Error(`Error al crear orden: ${orderError.message}`);
    }

    // Create order items
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await this.client
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[SupabaseOrderRepo] create items error:', itemsError.message);
      throw new Error(`Error al crear items de la orden: ${itemsError.message}`);
    }

    return order as Order;
  }

  async getByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseOrderRepo] getByUserId error:', error.message);
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }

    return (data ?? []) as Order[];
  }

  async getById(
    orderId: string
  ): Promise<(Order & { items: OrderItem[] }) | null> {
    const { data, error } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[SupabaseOrderRepo] getById error:', error.message);
      throw new Error(`Error al obtener orden: ${error.message}`);
    }

    return data
      ? { ...data, items: data.order_items } as Order & { items: OrderItem[] }
      : null;
  }
}
