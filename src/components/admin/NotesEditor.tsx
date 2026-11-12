"use client";

import { ActionForm, SubmitButton } from "./ui-client";
import { Field, Textarea } from "./ui";

/** Internal cost and service notes for a shipment. Staff only. */
export function NotesEditor({
  action,
  entityId,
  costNotes,
  serviceNotes,
}: {
  action: (formData: FormData) => Promise<void>;
  entityId: string;
  costNotes: string;
  serviceNotes: string;
}) {
  return (
    <ActionForm action={action} hidden={{ id: entityId }} success="Notes saved" error="The notes could not be saved. Try again.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cost notes" htmlFor={`cost-notes-${entityId}`} optional hint="Freight, port and handling charges, supplier quotes.">
          <Textarea id={`cost-notes-${entityId}`} name="cost_notes" rows={4} maxLength={5000} defaultValue={costNotes} />
        </Field>
        <Field label="Service notes" htmlFor={`service-notes-${entityId}`} optional hint="Special handling, delivery instructions, anything the team should know.">
          <Textarea id={`service-notes-${entityId}`} name="service_notes" rows={4} maxLength={5000} defaultValue={serviceNotes} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end">
        <SubmitButton pendingLabel="Saving…">Save notes</SubmitButton>
      </div>
    </ActionForm>
  );
}
