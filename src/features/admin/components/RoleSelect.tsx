"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateUserRoleAction } from "@/features/admin/actions/userActions";

export function RoleSelect({
  userId,
  current,
}: {
  userId: string;
  current: string;
}) {
  const [role, setRole] = useState(current);
  const [isPending, startTransition] = useTransition();

  function handleChange(newRole: "admin" | "customer") {
    if (newRole === role) return;

    setRole(newRole);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("role", newRole);
      const result = await updateUserRoleAction(userId, fd);
      if (result.error) {
        setRole(current); // revert
        toast.error(result.error);
      } else {
        toast.success(`Rol actualizado a ${newRole === "admin" ? "Administrador" : "Cliente"}`);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleChange("customer")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-luxury",
          role === "customer"
            ? "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/30"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <User className="h-3 w-3" />
        Cliente
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleChange("admin")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-luxury",
          role === "admin"
            ? "bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/30"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        Admin
      </button>
    </div>
  );
}
