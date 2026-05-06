import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Carrito",
  description: `Revisa tu pedido antes de pagar. ${BRAND.name}.`,
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
