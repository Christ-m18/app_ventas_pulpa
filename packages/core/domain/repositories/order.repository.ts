/**
 * Order Repository Interface — The "port" for order operations.
 */

import type { Order, OrderItem, CheckoutFormData } from '../entities/order';
import type { CartItem } from '../entities/product';

export interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  formData: CheckoutFormData;
  shippingCost: number;
}

export interface IOrderRepository {
  /** Create a new order with its items. */
  create(input: CreateOrderInput): Promise<Order>;

  /** Fetch orders for a specific user. */
  getByUserId(userId: string): Promise<Order[]>;

  /** Fetch a single order with its items. */
  getById(orderId: string): Promise<(Order & { items: OrderItem[] }) | null>;
}
