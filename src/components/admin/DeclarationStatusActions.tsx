"use client";

import { updateDeclarationStatus } from "@/app/admin/customs/actions";
import { ActionButton } from "./ui-client";
import { Card, CardHeader } from "./ui";

type Step = { label: string; next: string; primary?: boolean; success: string; confirm?: string };

const RAISE_QUERY: Step = { label: "Record a customs query", next: "query", success: "Marked as under query" };
const RELEASE: Step = {
  label: "Mark as released",
  next: "released",
  primary: true,
  success: "Declaration released",
  confirm: "Click again to release",
};

/** What can happen next from each status, and how to explain it. */
const NEXT: Record<string, { hint: string; steps: Step[] }> = {
  draft: {
    hint: "Once the declaration has been lodged with customs, mark it as submitted. Today is recorded as the submission date.",
    steps: [{ label: "Mark as submitted", next: "submitted", primary: true, success: "Declaration marked as submitted" }],
  },
  submitted: {
    hint: "Waiting on customs. Record a query if they ask for more information, or release the declaration once the cargo is cleared. A release cannot be undone here.",
    steps: [RAISE_QUERY, RELEASE],
  },
  query: {
    hint: "Record what customs asked for and the reply deadline in the details below. When you have answered them, mark the declaration as amended.",
    steps: [{ label: "Mark as amended and resubmitted", next: "amended", primary: true, success: "Declaration marked as amended" }],
  },
  amended: {
    hint: "The amended declaration is back with customs. Record another query if they raise one, or release it once the cargo is cleared. A release cannot be undone here.",
    steps: [RAISE_QUERY, RELEASE],
  },
};

export function DeclarationStatusActions({ declarationId, currentStatus }: { declarationId: string; currentStatus: string }) {
  const next = NEXT[currentStatus];
  if (!next) return null;

  return (
    <Card>
      <CardHeader title="Next step" description={next.hint} />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {next.steps.map((step) => (
          <ActionButton
            key={step.next}
            action={updateDeclarationStatus}
            fields={{ id: declarationId, status: step.next }}
            variant={step.primary ? "primary" : "secondary"}
            size="md"
            success={step.success}
            error="The status could not be changed. Try again."
            confirm={step.confirm}
          >
            {step.label}
          </ActionButton>
        ))}
      </div>
    </Card>
  );
}
