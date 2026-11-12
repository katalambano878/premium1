"use client";

import { Send } from "lucide-react";
import { ActionForm, SubmitButton } from "./ui-client";
import { inputClass } from "./ui";

interface NoteFormProps {
  action: (formData: FormData) => Promise<void>;
  entityId: string;
  fieldName?: string;
  placeholder?: string;
}

/** One-line note composer used on enquiry, shipment and client pages. */
export function NoteForm({ action, entityId, fieldName = "inquiry_id", placeholder = "Write a note for the team…" }: NoteFormProps) {
  return (
    <ActionForm action={action} success="Note added" resetOnSuccess hidden={{ [fieldName]: entityId }} className="flex gap-2">
      <label className="sr-only" htmlFor={`note-${entityId}`}>
        Note
      </label>
      <input id={`note-${entityId}`} name="body" required maxLength={5000} placeholder={placeholder} className={inputClass} />
      <SubmitButton pendingLabel="Adding…">
        <Send size={15} /> Add
      </SubmitButton>
    </ActionForm>
  );
}
