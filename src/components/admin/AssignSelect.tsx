"use client";

import { AutoSelect } from "./ui-client";

interface AssignSelectProps {
  currentAssignee: string | null;
  staff: { id: string; full_name: string }[];
  action: (formData: FormData) => Promise<void>;
  entityId: string;
}

/** Picks who owns a record; saves as soon as it changes. */
export function AssignSelect({ currentAssignee, staff, action, entityId }: AssignSelectProps) {
  return (
    <AutoSelect
      action={action}
      name="assigned_to"
      value={currentAssignee || ""}
      fields={{ id: entityId }}
      ariaLabel="Assigned to"
      success="Assignment updated"
      options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.full_name }))]}
    />
  );
}
