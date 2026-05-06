import type { OrderStatus, PaymentMethod, PaymentStatus } from "../../../../packages/core/domain/entities/order";

export type AdminOrderRow = {
  id: string;
  user_id: string | null;
  total: number;
  shipping_cost: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_address: string;
  zone: string;
  phone: string;
  notes: string | null;
  created_at: string;
};

export type AdminOrderListItem = AdminOrderRow & {
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
};

export type AdminOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string | null;
    unit: string;
  } | null;
};

export type AdminOrderDetail = AdminOrderRow & {
  customer: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: AdminOrderItem[];
  voucher: {
    id: string;
    storage_path: string;
    extracted: Record<string, unknown>;
    is_verified: boolean;
    confidence: number | null;
    warnings: string[];
    created_at: string;
  } | null;
};

export type AdminProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  unit: "lb" | "kg" | "paquete";
  image_url: string | null;
  category_id: string | null;
  category_name: string | null;
  is_combo: boolean;
  is_featured: boolean;
  benefits: string[];
  updated_at: string;
};

export type AdminInventoryLog = {
  id: string;
  product_id: string;
  product_name: string | null;
  change: number;
  reason: string;
  order_id: string | null;
  created_at: string;
};
