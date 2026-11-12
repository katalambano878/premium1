import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ROLE_INFO, canAccess, getCreateItems, getNavItems } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db/pool";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | Premium 1 Logistics", robots: { index: false, follow: false } };

type Badges = Record<string, { count: number; label: string; urgent?: boolean }>;

/** Counts shown in the sidebar: work waiting in each section this role can open. */
async function loadBadges(role: Parameters<typeof canAccess>[0]): Promise<Badges> {
  try {
    const { rows } = await query<{ new_inquiries: number; customs_queries: number; overdue_invoices: number }>(
      `SELECT (SELECT count(*)::int FROM inquiries WHERE status = 'new') AS new_inquiries,
              (SELECT count(*)::int FROM customs_declarations WHERE status = 'query') AS customs_queries,
              (SELECT count(*)::int FROM invoices WHERE status = 'overdue'
                  OR (status = 'sent' AND due_date IS NOT NULL AND due_date < CURRENT_DATE)) AS overdue_invoices`,
    );
    const r = rows[0];
    const badges: Badges = {};
    if (canAccess(role, "inquiries")) badges["/admin/inquiries"] = { count: r.new_inquiries, label: "new enquiries" };
    if (canAccess(role, "customs")) badges["/admin/customs"] = { count: r.customs_queries, label: "customs queries to answer", urgent: true };
    if (canAccess(role, "finance")) badges["/admin/finance"] = { count: r.overdue_invoices, label: "overdue invoices", urgent: true };
    return badges;
  } catch (e) {
    console.error("[admin layout] badge counts failed", e);
    return {};
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Re-checks the staff record on every request, so a deactivated account loses access at once.
  const user = await getSessionUser();
  if (!user) redirect("/auth/admin");

  return (
    <AdminShell
      navItems={getNavItems(user.role)}
      createItems={getCreateItems(user.role)}
      badges={await loadBadges(user.role)}
      user={{ name: user.fullName || user.email, email: user.email, roleLabel: ROLE_INFO[user.role]?.label || user.role }}
    >
      {children}
    </AdminShell>
  );
}
