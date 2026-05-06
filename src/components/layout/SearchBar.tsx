"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  placeholder?: string;
};

export function SearchBar({ className, placeholder = "Buscar pulpas, jugos..." }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "group flex h-11 items-center gap-2 rounded-full border border-border bg-card px-3 transition-luxury focus-within:border-brand-orange focus-within:shadow-md focus-within:shadow-brand-orange/10",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-luxury group-focus-within:text-brand-orange" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Limpiar búsqueda"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Limpiar
        </button>
      )}
    </form>
  );
}
