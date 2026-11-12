"use client";

import { AutoSelect } from "./ui-client";
import { statusLabel } from "./ui";

interface StatusSelectProps {
  currentStatus: string;
  statuses: readonly string[];
  action: (formData: FormData) => Promise<void>;
  entityId: string;
}

/** Changes a record's status; saves as soon as it changes and snaps back if the save fails. */
export function StatusSelect({ currentStatus, statuses, action, entityId }: StatusSelectProps) {
  return (
    <AutoSelect
      action={action}
      name="status"
      value={currentStatus}
      fields={{ id: entityId }}
      ariaLabel="Status"
      success="Status updated"
      options={statuses.map((s) => ({ value: s, label: statusLabel(s) }))}
    />
  );
}
