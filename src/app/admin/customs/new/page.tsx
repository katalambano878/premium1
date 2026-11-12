import { redirect } from "next/navigation";
import { Ship } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { ButtonLink, Callout, Card, Field, FormActions, Input, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/ui-client";
import { DbOffline } from "@/components/admin/shipments/parts";
import { createDeclaration } from "../actions";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createDeclaration(formData);
  redirect(id ? `/admin/customs/${id}` : "/admin/customs");
}

export default async function NewDeclarationPage({ searchParams }: { searchParams: Promise<{ shipment?: string | string[] }> }) {
  const params = await searchParams;
  const header = (
    <PageHeader
      title="New declaration"
      description="Start a customs declaration for a shipment. It begins as a draft; you can add HS codes and the declaration number later."
      back={{ href: "/admin/customs", label: "Customs" }}
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

  const { rows: shipments } = await query<{ id: string; shipment_no: string; origin: string; destination: string }>(
    "SELECT id, shipment_no, origin, destination FROM shipments ORDER BY created_at DESC LIMIT 300",
  );
  const preselected = shipments.find((s) => s.id === params.shipment)?.id || "";

  return (
    <div className="max-w-2xl">
      {header}

      {shipments.length === 0 ? (
        <Callout
          tone="warning"
          icon={Ship}
          title="Create a shipment first"
          action={<ButtonLink href="/admin/shipments/new">New shipment</ButtonLink>}
        >
          A declaration is always for a shipment, and there are none yet. Create the shipment, then come back to declare it.
        </Callout>
      ) : (
        <Card>
          <ActionForm action={handleCreate} success="Declaration created" error="The declaration could not be created. Check the details and try again.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shipment" htmlFor="shipment_id" required className="sm:col-span-2">
                <Select id="shipment_id" name="shipment_id" required defaultValue={preselected}>
                  <option value="" disabled>
                    Choose a shipment
                  </option>
                  {shipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shipment_no}: {s.origin} to {s.destination}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Declaration number"
                htmlFor="declaration_no"
                optional
                className="sm:col-span-2"
                hint="Leave blank if customs has not issued one yet."
              >
                <Input id="declaration_no" name="declaration_no" maxLength={100} placeholder="e.g. 40224123456" autoComplete="off" />
              </Field>
              <Field label="Estimated duty" htmlFor="duty_amount" optional hint="In the invoice currency.">
                <Input id="duty_amount" name="duty_amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" />
              </Field>
              <Field label="Estimated tax" htmlFor="tax_amount" optional hint="In the invoice currency.">
                <Input id="tax_amount" name="tax_amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" />
              </Field>
              <Field label="Notes" htmlFor="notes" optional className="sm:col-span-2">
                <Textarea id="notes" name="notes" rows={3} maxLength={5000} placeholder="Anything the clearing team should know" />
              </Field>
            </div>
            <FormActions>
              <ButtonLink href="/admin/customs" variant="secondary">
                Cancel
              </ButtonLink>
              <SubmitButton pendingLabel="Creating…">Create declaration</SubmitButton>
            </FormActions>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
