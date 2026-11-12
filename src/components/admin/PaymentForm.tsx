"use client";

import { ActionForm, SubmitButton } from "./ui-client";
import { Field, Input, Select } from "./ui";
import { PAYMENT_METHODS, formatMoney } from "./finance/format";

/** Records a payment against an invoice. The amount starts at the balance still owed. */
export function PaymentForm({
  invoiceId,
  action,
  balance,
  currency,
}: {
  invoiceId: string;
  action: (fd: FormData) => Promise<void>;
  balance: number;
  currency: string;
}) {
  const fid = (name: string) => `payment-${invoiceId}-${name}`;
  return (
    <ActionForm
      action={action}
      hidden={{ invoice_id: invoiceId }}
      success="Payment recorded"
      error="The payment could not be recorded. Check the amount and try again."
      resetOnSuccess
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Amount (${currency})`} htmlFor={fid("amount")} required hint={`Balance due: ${formatMoney(balance, currency)}`}>
          <Input
            id={fid("amount")}
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
            defaultValue={balance > 0 ? balance.toFixed(2) : ""}
            className="tabular-nums"
          />
        </Field>
        <Field label="Method" htmlFor={fid("method")}>
          <Select id={fid("method")} name="method" defaultValue="bank_transfer">
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reference" htmlFor={fid("reference")} optional hint="Bank or mobile money transaction ID.">
          <Input id={fid("reference")} name="reference" maxLength={200} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end">
        <SubmitButton pendingLabel="Recording…" className="w-full sm:w-auto">
          Record payment
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
