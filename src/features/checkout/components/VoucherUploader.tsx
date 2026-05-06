"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ImagePlus, Loader2, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
};

type Result = {
  is_verified: boolean;
  payment_status: string;
  confidence: number;
  warnings: string[];
  extracted: {
    amount: number | null;
    bank_emisor: string | null;
    sender_name: string | null;
    reference_number: string | null;
    date: string | null;
  };
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function VoucherUploader({ orderId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError("Solo aceptamos imágenes JPG, PNG o WEBP.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("La imagen pesa más de 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("voucher", file);
      const res = await fetch("/api/verify-voucher", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json?.error === "string" ? json.error : "Error verificando";
        setError(msg);
        toast.error(msg);
        return;
      }
      setResult(json as Result);
      if ((json as Result).is_verified) {
        toast.success("Pago verificado");
      } else {
        toast.info("Recibimos tu comprobante. Lo revisaremos en breve.");
      }
      router.refresh();
    } catch {
      setError("No pudimos contactar el servidor. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div
        className={cn(
          "rounded-2xl border p-5 text-sm",
          result.is_verified
            ? "border-brand-lime/40 bg-brand-lime/10 text-foreground"
            : "border-amber-500/40 bg-amber-500/10 text-foreground",
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          {result.is_verified ? (
            <CheckCircle2 className="h-6 w-6 text-brand-lime" aria-hidden />
          ) : (
            <ShieldAlert className="h-6 w-6 text-amber-500" aria-hidden />
          )}
          <p className="text-base font-bold">
            {result.is_verified
              ? "Pago verificado automáticamente"
              : "Comprobante recibido — en revisión"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          {result.extracted.amount != null && (
            <>
              <dt className="text-muted-foreground">Monto detectado</dt>
              <dd className="font-mono font-semibold">RD${result.extracted.amount.toFixed(2)}</dd>
            </>
          )}
          {result.extracted.bank_emisor && (
            <>
              <dt className="text-muted-foreground">Banco</dt>
              <dd>{result.extracted.bank_emisor}</dd>
            </>
          )}
          {result.extracted.sender_name && (
            <>
              <dt className="text-muted-foreground">Remitente</dt>
              <dd>{result.extracted.sender_name}</dd>
            </>
          )}
          {result.extracted.reference_number && (
            <>
              <dt className="text-muted-foreground">Referencia</dt>
              <dd className="font-mono">{result.extracted.reference_number}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Confianza IA</dt>
          <dd>{Math.round(result.confidence * 100)}%</dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={preview}
            alt="Vista previa del comprobante"
            width={600}
            height={400}
            className="h-auto w-full object-contain"
            unoptimized
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-luxury hover:border-brand-orange hover:bg-brand-orange/5"
        >
          <ImagePlus className="h-10 w-10 text-brand-orange" aria-hidden />
          <p className="text-sm font-semibold text-foreground">
            Toca para seleccionar el comprobante
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG o WEBP — máximo 5 MB</p>
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {file && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFile(null);
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={busy}
          >
            Cambiar imagen
          </Button>
        )}
        <Button type="button" onClick={handleUpload} disabled={!file || busy} size="lg">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Verificando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" aria-hidden />
              Subir y verificar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
