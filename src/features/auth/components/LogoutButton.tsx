"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
};

export function LogoutButton({
  variant = "outline",
  size = "default",
  className,
  label = "Cerrar sesión",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sesión cerrada");
    router.replace("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={busy}
      className={cn("gap-2", className)}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {busy ? "Saliendo..." : label}
    </Button>
  );
}
