/**
 * CreateOrder Use Case — Orchestrates order creation with validation.
 */

import { CheckoutFormSchema } from '../domain/entities/order';
import type { IOrderRepository } from '../domain/repositories/order.repository';
import type { Order } from '../domain/entities/order';
import type { CartItem } from '../domain/entities/product';
import { DELIVERY_ZONES } from '../domain/entities/order';
export class CreateOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(input: {
    userId: string;
    items: CartItem[];
    formData: unknown; // Raw input — will be validated
  }): Promise<Order> {
    // 1. Validate form data with Zod (hardened schema)
    const validatedForm = CheckoutFormSchema.parse(input.formData);

    // 2. Validate cart is not empty
    if (input.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // 3. Calculate shipping cost from zone
    const zone = DELIVERY_ZONES.find((z) => z.id === validatedForm.zone);
    if (!zone) {
      throw new Error('Zona de entrega no válida');
    }

    // 4. Validate stock availability
    for (const item of input.items) {
      if (item.quantity > item.product.stock) {
        throw new Error(
          `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`
        );
      }
    }

    // 5. Create order via repository
    return this.orderRepo.create({
      userId: input.userId,
      items: input.items,
      formData: validatedForm,
      shippingCost: zone.cost,
    });
  }
}
