"use client";

import { useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  markCashPaidAction,
  rejectVoucherAction,
  verifyVoucherAction,
} from "../actions/paymentActions";

type VoucherInfo = {
  id: string;
  storage_path: string;
  extracted: Record<string, unknown>;
  is_verified: boolean;
  confidence: number | null;
  warnings: string[];
  created_at: string;
} | null;

export function PaymentActions({
  orderId,
  paymentMethod,
  paymentStatus,
  voucher,
}: {
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  voucher: VoucherInfo;
}) {
  const [busy, setBusy] = useState(false);

  if (paymentStatus === "paid" || paymentStatus === "verified") {
    return (
      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
        <CheckCircle className="h-4 w-4" aria-hidden />
        Pago confirmado
      </p>
    );
  }

  if (paymentMethod === "cash_on_delivery" && paymentStatus === "pending_cash") {
    return (
      <Button
        size="sm"
        className="mt-4 bg-brand-lime text-emerald-900 hover:bg-brand-lime/80"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await markCashPaidAction({ orderId });
          setBusy(false);
          if (res.ok) toast.success("Cobro registrado");
          else toast.error(res.error ?? "Error");
        }}
      >
        {busy ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : null}
        Marcar efectivo cobrado
      </Button>
    );
  }

  if (paymentMethod === "bank_transfer" && voucher) {
    const extracted = voucher.extracted;
    return (
      <div className="mt-4 space-y-4">
        <div className="rounded-xl bg-muted/60 p-4 text-xs">
          <p className="mb-2 font-bold uppercase tracking-wider text-muted-foreground">
            Datos extraídos por IA (confianza: {((voucher.confidence ?? 0) * 100).toFixed(0)}%)
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {(["amount", "currency", "bank_emisor", "reference_number", "sender_name", "beneficiary_name", "date"] as const).map(
              (key) => {
                const val = extracted[key];
                if (val == null) return null;
                return (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{String(val)}</dd>
                  </div>
                );
              },
            )}
          </dl>
          {voucher.warnings.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-amber-700 dark:text-amber-400">
              {voucher.warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}
        </div>

        {!voucher.is_verified && paymentStatus !== "failed" && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-brand-lime text-emerald-900 hover:bg-brand-lime/80"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await verifyVoucherAction({
                  voucherId: voucher.id,
                  orderId,
                });
                setBusy(false);
                if (res.ok) toast.success("Comprobante verificado");
                else toast.error(res.error ?? "Error");
              }}
            >
              {busy ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              )}
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await rejectVoucherAction({
                  voucherId: voucher.id,
                  orderId,
                  reason: "Rechazado manualmente por administrador",
                });
                setBusy(false);
                if (res.ok) toast.success("Comprobante rechazado");
                else toast.error(res.error ?? "Error");
              }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Rechazar
            </Button>
          </div>
        )}

        {paymentStatus === "failed" && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
            <XCircle className="h-4 w-4" aria-hidden />
            Comprobante rechazado
          </p>
        )}
      </div>
    );
  }

  if (paymentMethod === "bank_transfer" && !voucher) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        El cliente aún no ha subido el comprobante.
      </p>
    );
  }

  return null;
}
