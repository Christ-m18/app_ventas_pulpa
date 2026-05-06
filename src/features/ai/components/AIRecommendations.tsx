'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Product } from '@/features/products/types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { toast } from 'sonner';

export function AIRecommendations({ allProducts }: { allProducts: Product[] }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ recommendation: string, productIds: string[] } | null>(null);

  const handleRecommend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        toast.error(data.error || "Error al comunicarse con el asistente. Revisa la clave API.");
        setResult(null);
        return;
      }
      
      setResult(data);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al contactar al asistente.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Preserve the exact order returned by the AI (from best to worst)
  const recommendedProducts = (result?.productIds || [])
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Asistente Nutricional Valeria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          ¿Buscas algo específico? Cuéntame tu objetivo (ej: &quot;quiero bajar de peso&quot;, &quot;necesito más energía&quot;) y te recomendaré la pulpa ideal.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Input
            className="min-h-11 flex-1"
            placeholder="Ej: Necesito algo refrescante y con vitaminas..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
          />
          <Button
            type="button"
            className="h-11 shrink-0 sm:min-w-12"
            onClick={handleRecommend}
            disabled={loading}
            aria-label="Enviar solicitud"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-background p-4 rounded-lg border text-sm">
              <p className="font-medium text-primary mb-1">Recomendación de Valeria:</p>
              {result.recommendation}
            </div>
            {recommendedProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendedProducts.map((product, index) => (
                  <div key={product.id} className="relative">
                    {index === 0 && recommendedProducts.length > 1 && (
                      <div className="absolute -top-3 -right-2 z-30 transform rotate-12">
                        <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white shadow-md">
                          ⭐ Mejor Opción
                        </span>
                      </div>
                    )}
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
