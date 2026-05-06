"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  DELIVERY_ZONES,
  REGION_LABELS,
  type DeliveryRegion,
} from "../../../../packages/core/domain/entities/order";
import { checkoutPayloadSchema, type CheckoutPayload } from "../schemas";
import { cn } from "@/lib/utils";

const ZONE_DEFAULT = "distrito-nacional";

// Group zones by region once (module scope) — DELIVERY_ZONES is constant.
const ZONES_BY_REGION = DELIVERY_ZONES.reduce<Record<DeliveryRegion, typeof DELIVERY_ZONES>>(
  (acc, z) => {
    (acc[z.region] ??= []).push(z);
    return acc;
  },
  {} as Record<DeliveryRegion, typeof DELIVERY_ZONES>,
);

const REGION_ORDER: DeliveryRegion[] = [
  "cibao-central",
  "cibao-norte",
  "cibao-noroeste",
  "capital",
  "este",
  "sur",
];

export function CheckoutForm() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const storeItems = useCartStore((s) => s.items);
  const storeTotal = useCartStore((s) => s.getTotal());
  const storeSubtotal = useCartStore((s) => s.getSubtotal());
  const storeDiscount = useCartStore((s) => s.getDiscount());

  // Use empty defaults during SSR to avoid hydration mismatch.
  // We use isMounted to ensure the first client render exactly matches the server.
  const items = isMounted ? storeItems : [];
  const total = isMounted ? storeTotal : 0;
  const subtotal = isMounted ? storeSubtotal : 0;
  const discount = isMounted ? storeDiscount : 0;
  
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutPayload>({
    resolver: zodResolver(checkoutPayloadSchema),
    defaultValues: {
      paymentMethod: "cash_on_delivery",
      zone: ZONE_DEFAULT,
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
    },
  });

  // useWatch is the memoizable variant — avoids the React Compiler skip.
  const selectedZoneId = useWatch({ control, name: "zone" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const zone = DELIVERY_ZONES.find((z) => z.id === selectedZoneId);
  const shipping = zone?.cost ?? 0;
  const grandTotal = total + shipping;

  const onSubmit = async (formValues: CheckoutPayload) => {
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CheckoutPayload = {
        ...formValues,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json?.error === "string" ? json.error : "No se pudo procesar el pedido";
        toast.error(msg);
        return;
      }
      toast.success("¡Pedido creado!");
      useCartStore.getState().clearCart();
      router.push(`/order-confirmation/${json.id}`);
    } catch {
      toast.error("No pudimos contactar el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" placeholder="Juan Pérez" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="juan@correo.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
              <Input id="phone" placeholder="809-000-0000" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select
                defaultValue={ZONE_DEFAULT}
                onValueChange={(value) => value && setValue("zone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu provincia" />
                </SelectTrigger>
                <SelectContent>
                  {REGION_ORDER.map((region) => {
                    const zones = ZONES_BY_REGION[region];
                    if (!zones?.length) return null;
                    return (
                      <SelectGroup key={region}>
                        <SelectLabel className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                          {REGION_LABELS[region]}
                        </SelectLabel>
                        {zones.map((z) => (
                          <SelectItem key={z.id} value={z.id}>
                            {z.name} (+RD${z.cost})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección detallada</Label>
              <Textarea
                id="address"
                placeholder="Calle, número, sector, referencias"
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" placeholder="Tocar el timbre fuerte" {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                {
                  id: "cash_on_delivery" as const,
                  icon: Banknote,
                  title: "Efectivo al recibir",
                  desc: "Pagas al chofer en la entrega.",
                },
                {
                  id: "bank_transfer" as const,
                  icon: Building2,
                  title: "Transferencia bancaria",
                  desc: "Subes el comprobante. Lo verificamos con IA.",
                },
              ].map(({ id, icon: Icon, title, desc }) => {
                const checked = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setValue("paymentMethod", id)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-luxury",
                      checked
                        ? "border-brand-orange bg-brand-orange/5 shadow-md shadow-brand-orange/15"
                        : "border-border bg-card hover:border-brand-orange/40",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        checked ? "bg-brand-orange text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.paymentMethod && (
              <p className="mt-2 text-xs text-destructive">{errors.paymentMethod.message}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Carrito vacío.</p>
              ) : (
                items.map((it) => (
                  <div key={it.product.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1">
                      {it.product.name} × {it.quantity}
                    </span>
                    <span className="font-medium">
                      RD${(it.product.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>RD${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Descuento por volumen</span>
                  <span>-RD${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Envío {zone ? `(${zone.name})` : ""}</span>
                <span>RD${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-orange">RD${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:bg-brand-orange/90"
              size="lg"
              disabled={submitting || items.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Procesando...
                </>
              ) : paymentMethod === "bank_transfer" ? (
                "Generar orden y subir comprobante"
              ) : (
                "Confirmar pedido"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
