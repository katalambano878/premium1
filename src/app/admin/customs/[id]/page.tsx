import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import {
  Callout,
  Card,
  CardHeader,
  DetailList,
  Field,
  Input,
  PageHeader,
  StatusBadge,
  Textarea,
  formatDate,
  formatDateTime,
} from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/ui-client";
import { DeclarationStatusActions } from "@/components/admin/DeclarationStatusActions";
import { DbOffline } from "@/components/admin/shipments/parts";
import { daysUntil, isUuid } from "@/components/admin/shipments/format";
import { updateDeclarationDetails } from "../actions";

type Declaration = {
  id: string;
  shipment_id: string;
  shipment_no: string;
  origin: string;
  destination: string;
  declaration_no: string | null;
  hs_codes: unknown;
  status: string;
  submitted_at: string | null;
  released_at: string | null;
  duty_amount: number | null;
  tax_amount: number | null;
  notes: string | null;
  query_details: string | null;
  query_deadline: string | null;
  created_at: string;
  updated_at: string | null;
};

function deadlineText(deadline: string | null) {
  const days = daysUntil(deadline);
  if (days === null) return "No reply deadline has been recorded. Add one in the details below.";
  const when = formatDate(deadline);
  if (days < 0) return `The reply was due on ${when}, ${-days} ${days === -1 ? "day" : "days"} ago.`;
  if (days === 0) return `The reply is due today, ${when}.`;
  return `Reply by ${when}, ${days} ${days === 1 ? "day" : "days"} from now.`;
}

export default async function DeclarationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (!createServiceRoleClient()) return <DbOffline />;

  const { rows } = await query<Declaration>(
    `SELECT d.*, s.shipment_no, s.origin, s.destination
       FROM customs_declarations d JOIN shipments s ON s.id = d.shipment_id
      WHERE d.id = $1`,
    [id],
  );
  const decl = rows[0];
  if (!decl) notFound();

  const hsCodes = Array.isArray(decl.hs_codes) ? decl.hs_codes.filter((c): c is string => typeof c === "string") : [];
  const underQuery = decl.status === "query";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={decl.declaration_no || "Declaration not yet numbered"}
        badge={<StatusBadge status={decl.status} />}
        back={{ href: "/admin/customs", label: "Customs" }}
        description={
          <>
            For shipment{" "}
            <Link href={`/admin/shipments/${decl.shipment_id}`} className="font-medium text-[var(--accent-ink)] underline-offset-4 hover:underline">
              {decl.shipment_no}
            </Link>
            , {decl.origin} to {decl.destination}
          </>
        }
      />

      <div className="space-y-5">
        {underQuery ? (
          <Callout tone="danger" icon={AlertTriangle} title="Customs has raised a query" className="sm:items-start">
            <p className="whitespace-pre-wrap break-words">
              {decl.query_details || "No details have been recorded yet. Add what customs asked for in the details below."}
            </p>
            <p className="mt-1 font-medium">{deadlineText(decl.query_deadline)}</p>
          </Callout>
        ) : null}

        {decl.status === "released" ? (
          <Callout tone="success" icon={CheckCircle2} title="Released by customs">
            {decl.released_at ? `Released on ${formatDate(decl.released_at)}. ` : ""}Nothing more to do on this declaration.
          </Callout>
        ) : (
          <DeclarationStatusActions declarationId={id} currentStatus={decl.status} />
        )}

        <Card>
          <CardHeader title="Timeline" />
          <DetailList
            columns={3}
            items={[
              { label: "Created", value: formatDate(decl.created_at) },
              { label: "Submitted", value: decl.submitted_at ? formatDate(decl.submitted_at) : <span className="font-normal text-slate-500">Not yet</span> },
              { label: "Released", value: decl.released_at ? formatDate(decl.released_at) : <span className="font-normal text-slate-500">Not yet</span> },
              ...(decl.updated_at ? [{ label: "Last changed", value: formatDateTime(decl.updated_at) }] : []),
              ...(!underQuery && decl.query_details
                ? [
                    {
                      label: decl.query_deadline ? `Last query (reply was due ${formatDate(decl.query_deadline)})` : "Last query",
                      value: <span className="whitespace-pre-wrap font-normal text-slate-600">{decl.query_details}</span>,
                    },
                  ]
                : []),
            ]}
          />
        </Card>

        <Card>
          <CardHeader title="Declaration details" description="Keep these up to date as customs assesses the shipment." />
          <ActionForm
            action={updateDeclarationDetails}
            hidden={{ id }}
            success="Declaration saved"
            error="The declaration could not be saved. Check the details and try again."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Declaration number" htmlFor="declaration_no" optional hint="Leave blank until customs issues one.">
                <Input id="declaration_no" name="declaration_no" maxLength={100} defaultValue={decl.declaration_no || ""} autoComplete="off" />
              </Field>
              <Field label="HS codes" htmlFor="hs_codes" optional hint="Separate several codes with commas.">
                <Input id="hs_codes" name="hs_codes" maxLength={2000} defaultValue={hsCodes.join(", ")} placeholder="8471.30, 8541.40" autoComplete="off" />
              </Field>
              <Field label="Duty" htmlFor="duty_amount" optional hint="In the invoice currency.">
                <Input
                  id="duty_amount"
                  name="duty_amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={decl.duty_amount ?? ""}
                />
              </Field>
              <Field label="Tax" htmlFor="tax_amount" optional hint="In the invoice currency.">
                <Input
                  id="tax_amount"
                  name="tax_amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={decl.tax_amount ?? ""}
                />
              </Field>

              {/* Only on the form while under query, so later saves leave the query history alone. */}
              {underQuery ? (
                <>
                  <Field label="What customs asked for" htmlFor="query_details" className="sm:col-span-2">
                    <Textarea
                      id="query_details"
                      name="query_details"
                      rows={3}
                      maxLength={5000}
                      defaultValue={decl.query_details || ""}
                      placeholder="e.g. Valuation queried; supplier proforma and proof of payment requested"
                    />
                  </Field>
                  <Field label="Reply deadline" htmlFor="query_deadline" hint="The declaration is flagged in the customs list from three days before this date.">
                    <Input id="query_deadline" name="query_deadline" type="date" defaultValue={decl.query_deadline?.slice(0, 10) || ""} />
                  </Field>
                </>
              ) : null}

              <Field label="Notes" htmlFor="notes" optional className="sm:col-span-2">
                <Textarea id="notes" name="notes" rows={3} maxLength={5000} defaultValue={decl.notes || ""} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
              <SubmitButton pendingLabel="Saving…">Save declaration</SubmitButton>
            </div>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
