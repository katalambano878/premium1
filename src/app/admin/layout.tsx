import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getNavItems } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Re-checks the staff record on every request, so a deactivated account loses access at once.
  const user = await getSessionUser();
  if (!user) redirect("/auth/admin");

  return (
    <AdminShell navItems={getNavItems(user.role)} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}
