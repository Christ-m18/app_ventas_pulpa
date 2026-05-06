/**
 * Checkout Types — Re-exports from @pulpas/core.
 */

export type {
  CheckoutFormData,
  DeliveryZone,
  OrderStatus,
  PaymentMethod,
} from '../../../../packages/core/domain/entities/order';

export {
  CheckoutFormSchema,
  DELIVERY_ZONES,
  OrderStatusEnum,
  PaymentMethodEnum,
} from '../../../../packages/core/domain/entities/order';

// Legacy alias for backward compatibility
export { CheckoutFormSchema as checkoutSchema } from '../../../../packages/core/domain/entities/order';
export { DELIVERY_ZONES as ZONES } from '../../../../packages/core/domain/entities/order';
