import { Building2, Copy } from "lucide-react";
import { CopyButton } from "@/features/checkout/components/CopyButton";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function BankAccountList() {
  let accounts: Array<{
    id: string;
    bank_name: string;
    account_holder: string;
    account_number: string;
    account_type: string;
  }> = [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("bank_accounts")
      .select("id, bank_name, account_holder, account_number, account_type")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    accounts = data ?? [];
  } catch {
    // Network or DB unreachable — render empty list, the user will see fallback.
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        No hay cuentas bancarias configuradas. Contacta al administrador.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {accounts.map((acc) => (
        <li
          key={acc.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{acc.bank_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {acc.account_holder} · {acc.account_type}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tracking-wide">
                {acc.account_number}
              </p>
            </div>
          </div>
          <CopyButton value={acc.account_number} aria-label={`Copiar número de ${acc.bank_name}`}>
            <Copy className="h-4 w-4" aria-hidden />
          </CopyButton>
        </li>
      ))}
    </ul>
  );
}
