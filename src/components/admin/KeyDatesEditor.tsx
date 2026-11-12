"use client";

import { ActionForm, SubmitButton } from "./ui-client";
import { Field, Input } from "./ui";

const DATE_FIELDS = [
  { key: "dispatch", label: "Dispatched" },
  { key: "arrival", label: "Arrival (ETA)" },
  { key: "clearance", label: "Customs cleared" },
  { key: "delivery", label: "Delivered" },
];

/** The four milestone dates of a shipment. Clients see them on the tracking page. */
export function KeyDatesEditor({
  action,
  entityId,
  current,
}: {
  action: (formData: FormData) => Promise<void>;
  entityId: string;
  current: Record<string, string>;
}) {
  return (
    <ActionForm action={action} hidden={{ id: entityId }} success="Dates saved" error="The dates could not be saved. Try again.">
      <div className="grid gap-4 sm:grid-cols-2">
        {DATE_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`date-${f.key}-${entityId}`} optional>
            <Input
              id={`date-${f.key}-${entityId}`}
              type="date"
              name={`date_${f.key}`}
              defaultValue={(current[f.key] || "").slice(0, 10)}
            />
          </Field>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <SubmitButton pendingLabel="Saving…">Save dates</SubmitButton>
      </div>
    </ActionForm>
  );
}
