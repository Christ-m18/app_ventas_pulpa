'use client';

import { useCartStore } from '../store/useCartStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { isVideoSource } from '@/features/products/utils/productImage';

import { useState, useEffect } from 'react';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotal, getSubtotal, getDiscount, getItemCount } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const itemCount = isMounted ? getItemCount() : 0;
  const total = isMounted ? getTotal() : 0;
  const subtotal = isMounted ? getSubtotal() : 0;
  const discount = isMounted ? getDiscount() : 0;
  const currentItems = isMounted ? items : [];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] bg-brand-orange text-white">
                {itemCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="grow my-4 pr-4">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded overflow-hidden shrink-0">
                    {item.product.image_url ? (
                      isVideoSource(item.product.image_url) ? (
                        <video 
                          src={item.product.image_url} 
                          className="w-full h-full object-cover" 
                          muted 
                          playsInline 
                        />
                      ) : (
                        <Image 
                          src={item.product.image_url} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover" 
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="grow">
                    <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">RD${item.product.price} x {item.quantity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-8 w-8"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {currentItems.length > 0 && (
          <SheetFooter className="flex-col gap-4">
            <div className="w-full border-t pt-4 flex flex-col gap-2">
              {discount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>RD${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-green-600">
                    <span>Descuento por volumen</span>
                    <span>-RD${discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center w-full mt-1">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-xl text-brand-orange">RD${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="w-full">
              <Button className="w-full bg-brand-orange text-white hover:bg-brand-orange/90" size="lg">
                Proceder al Checkout
              </Button>
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
