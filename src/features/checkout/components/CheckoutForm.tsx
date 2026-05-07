"use client";
// Force recompile: 3.0

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  DELIVERY_ZONES,
  REGION_LABELS,
  type DeliveryRegion,
} from "../../../../packages/core/domain/entities/order";
import { checkoutPayloadSchema, type CheckoutPayload } from "../schemas";
import { cn } from "@/lib/utils";
import { Search, MapPin, Check, Globe2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ZONE_DEFAULT = "distrito-nacional";

const REGION_ORDER: DeliveryRegion[] = [
  "cibao-central",
  "cibao-norte",
  "cibao-noroeste",
  "capital",
  "este",
  "sur",
];

function SmartZoneSelector({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedZone = DELIVERY_ZONES.find(z => z.id === value);
  
  const filteredZones = DELIVERY_ZONES.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    REGION_LABELS[z.region].toLowerCase().includes(search.toLowerCase())
  );

  const zonesByRegion = filteredZones.reduce<Record<DeliveryRegion, typeof DELIVERY_ZONES>>(
    (acc, z) => {
      (acc[z.region] ??= []).push(z);
      return acc;
    },
    {} as Record<DeliveryRegion, typeof DELIVERY_ZONES>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button 
            variant="outline" 
            role="combobox" 
            className="w-full justify-between h-12 px-4 bg-background border-border hover:border-brand-orange/50 transition-all rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-orange/10 p-1.5 rounded-lg">
                <MapPin className="h-4 w-4 text-brand-orange" />
              </div>
              <span className={cn(
                "font-semibold truncate max-w-[150px] sm:max-w-[220px]", 
                !selectedZone && "text-muted-foreground"
              )}>
                {selectedZone ? selectedZone.name : "Selecciona tu provincia..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedZone && (
                <Badge variant="secondary" className="bg-brand-orange/10 text-brand-orange border-transparent">
                  +RD${selectedZone.cost}
                </Badge>
              )}
              <Globe2 className="h-4 w-4 opacity-50 shrink-0" />
            </div>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-orange" />
            Zona de Entrega
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Escribe tu provincia o ciudad..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-muted/50 border-transparent focus:bg-background transition-all"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-4">
            {REGION_ORDER.map((region) => {
              const regionZones = zonesByRegion[region];
              if (!regionZones?.length) return null;
              
              return (
                <div key={region} className="space-y-1">
                  <h4 className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/80 bg-brand-orange/5 rounded-md mb-1">
                    {REGION_LABELS[region]}
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {regionZones.map((z) => {
                      const isActive = value === z.id;
                      return (
                        <button
                          key={z.id}
                          onClick={() => {
                            onChange(z.id);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                            isActive 
                              ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" 
                              : "hover:bg-brand-orange/10 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full transition-all shrink-0",
                              isActive ? "bg-white scale-125" : "bg-muted-foreground/30 group-hover:bg-brand-orange"
                            )} />
                            <span className="font-semibold truncate pr-2">{z.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-bold",
                              isActive ? "text-white/90" : "text-muted-foreground"
                            )}>
                              +RD${z.cost}
                            </span>
                            {isActive && <Check className="h-4 w-4 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {filteredZones.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <Globe2 className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">No encontramos esa zona.</p>
                <p className="text-xs text-muted-foreground/60">Prueba con otro nombre o provincia.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t bg-muted/20 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Cobertura Nacional Garantizada
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DiscountProgress({ subtotal }: { subtotal: number }) {
  const nextTier = subtotal < 5000 ? 5000 : subtotal < 10000 ? 10000 : subtotal < 20000 ? 20000 : null;
  const currentDiscount = subtotal < 5000 ? 0 : subtotal < 10000 ? 5 : subtotal < 20000 ? 10 : 15;
  
  return (
    <div className="rounded-xl bg-brand-orange/5 p-4 border border-brand-orange/10 space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">Plan de Ahorro</span>
        <span className="text-xs font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
          {currentDiscount}% OFF
        </span>
      </div>
      
      {nextTier && (
        <p className="text-[11px] text-muted-foreground leading-snug">
          ¡Faltan <span className="font-bold text-foreground underline decoration-brand-orange/30">RD${(nextTier - subtotal).toFixed(2)}</span> para obtener un <span className="font-bold text-brand-orange">{currentDiscount === 0 ? 5 : currentDiscount === 5 ? 10 : 15}%</span> de descuento!
        </p>
      )}

      <div className="flex gap-1.5 overflow-hidden">
        {[
          { label: "5k", discount: "5%", min: 5000 },
          { label: "10k", discount: "10%", min: 10000 },
          { label: "20k", discount: "15%", min: 20000 },
        ].map((tier) => {
          const isActive = subtotal >= tier.min;
          return (
            <div 
              key={tier.label}
              className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 rounded-lg border transition-all duration-300",
                isActive 
                  ? "bg-brand-orange border-transparent shadow-sm shadow-brand-orange/20 scale-[1.02]" 
                  : "bg-background border-border opacity-60"
              )}
            >
              <span className={cn("text-[9px] font-bold uppercase", isActive ? "text-white/80" : "text-muted-foreground")}>{tier.label}</span>
              <span className={cn("text-[11px] font-black", isActive ? "text-white" : "text-foreground")}>{tier.discount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState warning while still handling hydration correctly
    queueMicrotask(() => setIsMounted(true));
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
      items: [],
    },
  });

  // Sync cart items to form state after mount to avoid hydration mismatch
  useEffect(() => {
    if (isMounted && storeItems.length > 0) {
      setValue(
        "items",
        storeItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        { shouldValidate: true }
      );
    }
  }, [isMounted, storeItems, setValue]);

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

  if (!isMounted) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
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
              <Label>Zona de entrega</Label>
              <SmartZoneSelector 
                value={selectedZoneId || ZONE_DEFAULT} 
                onChange={(val) => setValue("zone", val, { shouldValidate: true })} 
              />
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
          <CardContent className="space-y-6">
            <DiscountProgress subtotal={subtotal} />
            
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Detalle de items</h3>
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
