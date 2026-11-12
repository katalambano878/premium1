import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { InvoiceForm } from "@/components/admin/InvoiceForm";
import { isUuid } from "@/components/admin/finance/format";
import { ButtonLink, Callout, PageHeader } from "@/components/admin/ui";
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
    <div className="max-w-4xl">
      <PageHeader
        title="New invoice"
        description="The invoice is saved as a draft. Mark it as sent once the client has it."
        back={{ href: "/admin/finance", label: "Finance" }}
      />
      {clients.length ? (
        <InvoiceForm action={handleCreate} clients={clients} shipments={shipments} defaultClientId={clientId} defaultShipmentId={shipment?.id} />
      ) : (
        <Callout
          tone="warning"
          icon={Users}
          title="Add a client first"
          action={
            <ButtonLink href="/admin/clients/new">
              <Plus size={16} aria-hidden /> New client
            </ButtonLink>
          }
        >
          Every invoice is billed to a client, and there are none yet.
        </Callout>
      )}
    </div>
  );
}
