"use client";

import { useState, useRef } from "react";
import { FileText, Download, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { jsPDF } from "jspdf";
import { formatPhone } from "@/lib/format-phone";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface InvoiceDialogProps {
  order: {
    id: string;
    created_at: string;
    customer_name: string | null;
    customer_email: string | null;
    total: number;
    subtotal?: number;
    shipping_cost: number;
    delivery_address: string;
    phone: string;
    payment_method: string;
    order_items: Array<{
      id: string;
      quantity: number;
      price: number;
      products: { name: string } | null;
    }>;
  };
}

// Subcomponente para reutilizar el diseño sin duplicar lógica
function InvoiceContent({ order }: { order: InvoiceDialogProps["order"] }) {
  const orderDate = new Date(order.created_at);
  const orderIdShort = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="bg-white p-8 md:p-12 text-slate-950 w-full max-w-[800px] mx-auto border-0">
      {/* Invoice Header */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-black text-brand-orange mb-1 leading-tight">RICHARD<br/>PULPAS</h2>
          <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed">
            Frutas frescas y pulpas de la mejor calidad.
            Los Hornos, La Vega, República Dominicana.
            <br />
            <span className="font-bold text-slate-400">Tel: (809) 696-1049</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">No. Factura</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mb-4 tracking-tighter">#{orderIdShort}</div>
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Fecha</div>
          <div className="text-sm font-medium text-slate-900">
            {format(orderDate, "PPP", { locale: es })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 border-b-2 border-slate-100 pb-1">Cliente</h3>
          <div className="text-base font-bold text-slate-900">{order.customer_name || "Cliente General"}</div>
          <div className="text-sm text-slate-600">{order.customer_email || ""}</div>
          <div className="text-sm text-slate-600 mt-1">{formatPhone(order.phone)}</div>
        </div>
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 border-b-2 border-slate-100 pb-1">Enviar a</h3>
          <div className="text-sm text-slate-600 leading-relaxed italic">
            {order.delivery_address}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse mb-12">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Descripción</th>
            <th className="py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">Cant.</th>
            <th className="py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-right">Precio</th>
            <th className="py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-4 text-sm font-bold text-slate-900">{item.products?.name || "Producto"}</td>
              <td className="py-4 text-sm text-slate-600 text-center">{item.quantity}</td>
              <td className="py-4 text-sm text-slate-600 text-right">RD${Number(item.price).toLocaleString()}</td>
              <td className="py-4 text-sm font-black text-slate-900 text-right">RD${(item.quantity * item.price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full md:w-72 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span className="uppercase tracking-wider font-medium">Subtotal</span>
            <span className="font-bold">RD${(Number(order.total) - Number(order.shipping_cost)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span className="uppercase tracking-wider font-medium">Envío</span>
            <span className="font-bold">RD${Number(order.shipping_cost).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t-4 border-slate-900">
            <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Total</span>
            <span className="text-3xl font-black text-brand-orange">RD${Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-16 pt-8 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 mb-2">
          Gracias por preferir a <span className="font-bold text-brand-orange underline">Richard Pulpas</span>.
        </p>
        <p className="text-[10px] text-slate-300 italic">
          Esta es una factura digital válida como comprobante de compra.
        </p>
      </div>
    </div>
  );
}

export function InvoiceDialog({ order }: InvoiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!captureRef.current) return;
    
    setIsGenerating(true);
    const toastId = toast.loading("Generando factura PDF completa...");
    
    try {
      // Forzamos un renderizado limpio
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = captureRef.current;
      
      // Capturamos el elemento OCULTO que no tiene scroll ni restricciones de pantalla
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        // No aplicamos estilos aquí, dejamos que el div contenedor controle el ancho
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      // Escalamos para que quepa en el ancho A4
      const targetWidth = pdfWidth;
      const targetHeight = (img.height * targetWidth) / img.width;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, targetWidth, targetHeight);
      pdf.save(`Factura_RichardPulpas_${order.id.slice(0, 8)}.pdf`);
      
      toast.success("Factura descargada correctamente", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" className="flex items-center gap-2 border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5">
              <FileText className="h-4 w-4" />
              Ver Factura
            </Button>
          }
        />
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white text-slate-950 shadow-2xl">
          <DialogHeader className="p-6 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange rounded-lg p-1.5">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold">Factura de Compra</DialogTitle>
            </div>
            <Button 
              size="sm" 
              className="gap-2 bg-brand-orange text-white hover:bg-brand-orange/90" 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar PDF
            </Button>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[80vh] bg-white">
            <InvoiceContent order={order} />
          </div>
        </DialogContent>
      </Dialog>

      {/* ELEMENTO OCULTO PARA CAPTURA PERFECTA */}
      {/* Este div está fuera del viewport y tiene un ancho fijo, asegurando que el PDF nunca se recorte */}
      <div 
        aria-hidden="true"
        style={{ 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px', 
          width: '800px',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      >
        <div ref={captureRef} className="bg-white">
          <InvoiceContent order={order} />
        </div>
      </div>
    </>
  );
}
