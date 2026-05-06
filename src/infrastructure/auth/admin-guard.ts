import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/infrastructure/auth/dal";

export type AdminProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: "admin";
  mfa_required: boolean;
};

export const getAdminProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") return null;
  return { user, profile: profile as AdminProfile };
});

export async function requireAdmin() {
  const ctx = await getAdminProfile();
  if (!ctx) redirect("/login?next=/admin");
  return ctx;
}
