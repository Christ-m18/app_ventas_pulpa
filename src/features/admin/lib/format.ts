import { DELIVERY_ZONES } from "../../../../packages/core/domain/entities/order";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Por procesar",
  processing: "Procesando",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  awaiting_voucher: "Esperando comprobante",
  pending_review: "Por revisar",
  verified: "Verificado",
  pending_cash: "Por cobrar (efectivo)",
  paid: "Pagado",
  failed: "Rechazado",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Efectivo al recibir",
  bank_transfer: "Transferencia",
};

const zoneNameById = new Map(DELIVERY_ZONES.map((z) => [z.id, z.name]));
export function zoneLabel(id: string): string {
  return zoneNameById.get(id) ?? id;
}

const dateFmt = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santo_Domingo",
});

const dayFmt = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeZone: "America/Santo_Domingo",
});

export function formatDateTime(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDay(iso: string): string {
  return dayFmt.format(new Date(iso));
}

export function formatRD(amount: number): string {
  return `RD$${amount.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function statusToneClasses(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "processing":
      return "bg-brand-lemon/20 text-amber-800 dark:text-brand-lemon";
    case "out_for_delivery":
      return "bg-brand-mandarin/20 text-brand-orange";
    case "delivered":
      return "bg-brand-lime/20 text-emerald-700 dark:text-brand-lime";
    case "cancelled":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function paymentStatusToneClasses(status: string): string {
  switch (status) {
    case "verified":
    case "paid":
      return "bg-brand-lime/20 text-emerald-700 dark:text-brand-lime";
    case "pending_review":
    case "awaiting_voucher":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "pending_cash":
      return "bg-brand-lemon/20 text-amber-800 dark:text-brand-lemon";
    case "failed":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}
