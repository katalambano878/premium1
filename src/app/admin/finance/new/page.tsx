import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { InvoiceForm } from "@/components/admin/InvoiceForm";
import { isUuid } from "@/components/admin/finance/format";
import { ButtonLink, Callout, DeskBanner } from "@/components/admin/ui";
import { query } from "@/lib/db/pool";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createInvoice } from "../actions";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createInvoice(formData);
  redirect(id ? `/admin/finance/${id}` : "/admin/finance");
}

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string; shipment?: string }> }) {
  const params = await searchParams;
  if (!createServiceRoleClient()) return <Callout tone="warning" title="The database is not connected." />;

  const [{ rows: clients }, { rows: shipments }] = await Promise.all([
    query<{ id: string; company_name: string; payment_terms: string | null }>(
      "SELECT id, company_name, payment_terms FROM clients ORDER BY LOWER(company_name)",
    ),
    query<{ id: string; shipment_no: string; client_id: string; origin: string; destination: string }>(
      "SELECT id, shipment_no, client_id, origin, destination FROM shipments ORDER BY created_at DESC LIMIT 500",
    ),
  ]);

  // Links from a client or shipment page arrive with that record already chosen.
  const shipment = isUuid(params.shipment || "") ? shipments.find((s) => s.id === params.shipment) : undefined;
  const clientId = shipment?.client_id || (clients.some((c) => c.id === params.client) ? params.client : undefined);

  return (
    <div className="space-y-6">
      <DeskBanner
        eyebrow="Finance"
        title="New invoice"
        accent="draft"
        description="The invoice is saved as a draft. Mark it as sent once the client has it."
        back={{ href: "/admin/finance", label: "Finance" }}
      />
      {clients.length ? (
        <InvoiceForm action={handleCreate} clients={clients} shipments={shipments} defaultClientId={clientId} defaultShipmentId={shipment?.id} />
      ) : (
        <section className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(11,31,58,0.5)] ring-1 ring-[var(--navy)]/8 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)]">Before a bill</p>
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-editorial text-4xl leading-none text-[var(--navy)]">
                Add a client <span className="italic text-[var(--accent-hover)]">first</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Every invoice is billed to a client, and there are none yet. Once a company is on file, this page becomes the draft form.</p>
            </div>
            <ButtonLink href="/admin/clients/new" className="self-start !rounded-full sm:self-auto">
              <Plus size={16} aria-hidden /> New client
            </ButtonLink>
          </div>
          <p className="pointer-events-none mt-8 font-editorial text-7xl leading-none text-[var(--accent)]/40" aria-hidden>
            01
          </p>
        </section>
      )}
    </div>
  );
}
