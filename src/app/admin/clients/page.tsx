import Link from "next/link";
import { Plus, Search, SearchX, Users } from "lucide-react";
import { paymentTermsLabel } from "@/components/admin/clients/options";
import {
  ButtonLink,
  Callout,
  EmptyState,
  FilterTabs,
  Input,
  PageHeader,
  StatusBadge,
  TableCard,
  buttonClass,
  cx,
  initials,
  rowLinkClass,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/admin/ui";
import { query } from "@/lib/db/pool";
import { createServiceRoleClient } from "@/lib/supabase/server";

const TIERS = [
  { value: "vip", label: "VIP" },
  { value: "standard", label: "Standard" },
  { value: "new", label: "New" },
];
const LIMIT = 200;

type ClientRow = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  tier: string;
  payment_terms: string | null;
  shipments: number;
};

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ tier?: string; q?: string }> }) {
  const params = await searchParams;
  if (!createServiceRoleClient()) return <Callout tone="warning" title="The database is not connected." />;

  const tier = TIERS.some((t) => t.value === params.tier) ? (params.tier as string) : null;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  // The search text is only ever sent as a query parameter, with LIKE wildcards escaped.
  const pattern = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null;

  const [{ rows: counts }, { rows: clients }] = await Promise.all([
    query<{ tier: string; n: number }>("SELECT COALESCE(tier, 'standard') AS tier, COUNT(*)::int AS n FROM clients GROUP BY 1"),
    query<ClientRow>(
      `SELECT c.id, c.company_name, c.contact_name, c.email, c.phone, c.industry,
              COALESCE(c.tier, 'standard') AS tier, c.payment_terms,
              COALESCE(s.n, 0)::int AS shipments
         FROM clients c
         LEFT JOIN (SELECT client_id, COUNT(*) AS n FROM shipments GROUP BY client_id) s ON s.client_id = c.id
        WHERE ($1::text IS NULL OR COALESCE(c.tier, 'standard') = $1)
          AND ($2::text IS NULL OR c.company_name ILIKE $2 OR c.contact_name ILIKE $2 OR c.email ILIKE $2 OR c.phone ILIKE $2)
        ORDER BY LOWER(c.company_name)
        LIMIT ${LIMIT + 1}`,
      [tier, pattern],
    ),
  ]);

  const total = counts.reduce((sum, c) => sum + c.n, 0);
  const countFor = (value: string) => counts.find((c) => c.tier === value)?.n || 0;
  const shown = clients.slice(0, LIMIT);
  const filtered = Boolean(tier || q);

  const href = (nextTier: string | null) => {
    const sp = new URLSearchParams();
    if (nextTier) sp.set("tier", nextTier);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/clients?${qs}` : "/admin/clients";
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Every company we ship for, with their contact, terms and history."
        actions={
          <ButtonLink href="/admin/clients/new">
            <Plus size={16} aria-hidden /> New client
          </ButtonLink>
        }
      />

      {total === 0 ? (
        <TableCard>
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="A client is a company you ship for. Add one to start creating shipments and invoices for them."
            action={
              <ButtonLink href="/admin/clients/new">
                <Plus size={16} aria-hidden /> New client
              </ButtonLink>
            }
          />
        </TableCard>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterTabs
              items={[
                { label: "All", href: href(null), count: total, active: !tier },
                ...TIERS.map((t) => ({ label: t.label, href: href(t.value), count: countFor(t.value), active: tier === t.value })),
              ]}
            />
            <form action="/admin/clients" method="get" role="search" className="flex gap-2 lg:w-80">
              {tier ? <input type="hidden" name="tier" value={tier} /> : null}
              <label htmlFor="client-search" className="sr-only">
                Search clients
              </label>
              <div className="relative min-w-0 flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
                <Input
                  id="client-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  maxLength={100}
                  placeholder="Company, contact, email or phone"
                  className="min-h-11 py-2 pl-10"
                />
              </div>
              <button type="submit" className={buttonClass("secondary")}>
                Search
              </button>
            </form>
          </div>

          <TableCard
            footer={
              shown.length
                ? clients.length > LIMIT
                  ? `Showing the first ${LIMIT} clients. Search to narrow the list.`
                  : `${shown.length} ${shown.length === 1 ? "client" : "clients"}${filtered ? " match" : ""}`
                : undefined
            }
          >
            {shown.length ? (
              <table className={cx(tableClass, "min-w-[880px]")}>
                <thead>
                  <tr>
                    <th className={thClass}>Company</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>Phone</th>
                    <th className={thClass}>Industry</th>
                    <th className={thClass}>Tier</th>
                    <th className={thClass}>Payment terms</th>
                    <th className={cx(thClass, "text-right")}>Shipments</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((c) => (
                    <tr key={c.id} className={trClass}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px] font-medium text-slate-600"
                          >
                            {initials(c.company_name)}
                          </span>
                          <Link href={`/admin/clients/${c.id}`} className={rowLinkClass}>
                            {c.company_name}
                          </Link>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <p className="text-[var(--navy)]">{c.contact_name || "—"}</p>
                        {c.email ? <p className="text-[13px] text-slate-500">{c.email}</p> : null}
                      </td>
                      <td className={cx(tdClass, "whitespace-nowrap tabular-nums")}>{c.phone || "—"}</td>
                      <td className={tdClass}>{c.industry || "—"}</td>
                      <td className={tdClass}>
                        <StatusBadge status={c.tier} />
                      </td>
                      <td className={cx(tdClass, "whitespace-nowrap")}>{paymentTermsLabel(c.payment_terms)}</td>
                      <td className={cx(tdClass, "text-right tabular-nums")}>{c.shipments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No clients match"
                description={
                  q
                    ? `Nothing found for "${q}"${tier ? " in this tier" : ""}. Check the spelling or clear the filters.`
                    : "No clients are in this tier yet. Change a client's tier from their page."
                }
                action={
                  <ButtonLink href="/admin/clients" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            )}
          </TableCard>
        </div>
      )}
    </div>
  );
}
