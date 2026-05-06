import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { ShoppingBag } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  products: {
    name: string;
  };
};

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  payment_method: string;
  order_items: OrderItem[];
};

const statusLabels: Record<Order["status"], { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "En proceso", color: "bg-blue-100 text-blue-800" },
  out_for_delivery: { label: "En camino", color: "bg-brand-mandarin/20 text-brand-orange" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export async function OrderHistory() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id, created_at, total, status, payment_method,
      order_items ( id, quantity, price, product_id, products(name) )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium">No tienes pedidos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Cuando realices una compra, aparecerá aquí tu historial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(orders as unknown as Order[]).map((order) => (
        <div key={order.id} className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b">
            <div>
              <p className="text-sm font-medium">Pedido #{order.id.split("-")[0]}</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(order.created_at))}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="font-semibold">RD${order.total.toFixed(2)}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabels[order.status].color}`}>
                {statusLabels[order.status].label}
              </span>
            </div>
          </div>
          
          <ul className="space-y-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.products?.name || "Producto"}
                </span>
                <span>RD${(item.quantity * item.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
