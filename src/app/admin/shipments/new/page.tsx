import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { ButtonLink, Callout, Card, Field, FormActions, Input, PageHeader, Select } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/ui-client";
import { DbOffline } from "@/components/admin/shipments/parts";
import { createShipment } from "../actions";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createShipment(formData);
  redirect(id ? `/admin/shipments/${id}` : "/admin/shipments");
}

export default async function NewShipmentPage({ searchParams }: { searchParams: Promise<{ client?: string | string[] }> }) {
  const params = await searchParams;
  const header = (
    <PageHeader
      title="New shipment"
      description="Start a job for a client. It begins as a draft; you can add dates, documents and updates once it exists."
      back={{ href: "/admin/shipments", label: "Shipments" }}
    />
  );

  if (!createServiceRoleClient()) {
    return (
      <>
        {header}
        <DbOffline />
      </>
    );
  }

  const { rows: clients } = await query<{ id: string; company_name: string }>(
    "SELECT id, company_name FROM clients ORDER BY company_name",
  );
  const preselected = clients.find((c) => c.id === params.client)?.id || "";

  return (
    <div className="max-w-2xl">
      {header}

      {clients.length === 0 ? (
        <Callout
          tone="warning"
          icon={Users}
          title="Add a client first"
          action={<ButtonLink href="/admin/clients/new">Add a client</ButtonLink>}
        >
          Every shipment belongs to a client, and there are none yet. Add the client, then come back to create the shipment.
        </Callout>
      ) : (
        <Card>
          <ActionForm action={handleCreate} success="Shipment created" error="The shipment could not be created. Check the details and try again.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Client"
                htmlFor="client_id"
                required
                className="sm:col-span-2"
                hint={
                  <>
                    Not in the list?{" "}
                    <Link href="/admin/clients/new" className="font-medium text-[var(--accent-ink)] underline-offset-4 hover:underline">
                      Add a new client
                    </Link>
                    .
                  </>
                }
              >
                <Select id="client_id" name="client_id" required defaultValue={preselected}>
                  <option value="" disabled>
                    Choose a client
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Origin" htmlFor="origin" required hint="Where the cargo is collected or loaded.">
                <Input id="origin" name="origin" required maxLength={200} placeholder="e.g. Guangzhou, China" autoComplete="off" />
              </Field>
              <Field label="Destination" htmlFor="destination" required hint="Where it is going.">
                <Input id="destination" name="destination" required maxLength={200} placeholder="e.g. Tema Port, Ghana" autoComplete="off" />
              </Field>
              <Field label="Method" htmlFor="method" className="sm:col-span-2">
                <Select id="method" name="method" defaultValue="sea">
                  <option value="sea">Sea</option>
                  <option value="air">Air</option>
                  <option value="road">Road</option>
                </Select>
              </Field>
            </div>
            <FormActions>
              <ButtonLink href="/admin/shipments" variant="secondary">
                Cancel
              </ButtonLink>
              <SubmitButton pendingLabel="Creating…">Create shipment</SubmitButton>
            </FormActions>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
