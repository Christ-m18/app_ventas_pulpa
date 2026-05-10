import type { Metadata } from "next";
import { requireAdmin } from "@/infrastructure/auth/admin-guard";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminTopbar } from "@/features/admin/components/AdminTopbar";
import { AdminMobileNav } from "@/features/admin/components/AdminMobileNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  description: "Panel de administración D'Richard Pulpas Al Natural.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();
  const displayName = profile.full_name?.trim() || user.email?.split("@")[0] || "Admin";

  return (
    <div className="admin-shell">
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <AdminTopbar displayName={displayName} email={user.email ?? ""} />
          <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">{children}</main>
          <AdminMobileNav />
        </div>
      </div>
    </div>
  );
}
