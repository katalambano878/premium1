"use client";

import { ActionButton, ActionForm, SubmitButton } from "./ui-client";
import { Field, Input, StatusBadge, formatDateTime } from "./ui";

/** Shows when the next follow-up is due and lets staff set, change or clear it. */
export function FollowUpForm({
  action,
  entityId,
  current,
  overdue = false,
}: {
  action: (formData: FormData) => Promise<void>;
  entityId: string;
  current: string | null;
  /** True when the follow-up time has passed and the enquiry is still open. */
  overdue?: boolean;
}) {
  const inputId = `follow-up-${entityId}`;
  return (
    <div>
      {current ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className={overdue ? "text-sm font-medium text-red-700" : "text-sm font-medium text-[var(--navy)]"}>
            {overdue ? "Was due" : "Due"} {formatDateTime(current)}
          </p>
          {overdue ? <StatusBadge tone="red" label="Overdue" /> : null}
        </div>
      ) : (
        <p className="mb-4 text-sm leading-6 text-slate-500">
          No follow-up is set. Add a date and the enquiry list will flag it once that time has passed.
        </p>
      )}

      {/* Keyed on the saved value so the field resets after a save or a clear. */}
      <ActionForm
        key={current || "none"}
        action={action}
        hidden={{ id: entityId }}
        success={current ? "Follow-up updated" : "Follow-up set"}
        error="The follow-up could not be saved. Please try again."
      >
        <Field label={current ? "Change date and time" : "Date and time"} htmlFor={inputId}>
          <Input id={inputId} type="datetime-local" name="follow_up_at" required defaultValue={current ? current.slice(0, 16) : ""} />
        </Field>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SubmitButton variant="secondary" size="sm" pendingLabel="Saving…">
            {current ? "Save change" : "Set follow-up"}
          </SubmitButton>
          {current ? (
            <ActionButton action={action} fields={{ id: entityId, follow_up_at: "" }} variant="ghost" success="Follow-up cleared">
              Clear
            </ActionButton>
          ) : null}
        </div>
      </ActionForm>
    </div>
  );
}
