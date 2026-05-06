import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Checkout",
  description: `Confirma tu pedido de ${BRAND.name}. Dudas: ${BRAND.instagram.handle}.`,
};

export default function CheckoutPage() {
  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-5 md:px-0 md:py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Finalizar compra</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Completa tus datos para coordinar el envío de tus pulpas.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}
