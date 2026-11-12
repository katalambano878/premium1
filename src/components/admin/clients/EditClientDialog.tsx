"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ClientForm } from "../ClientForm";
import { Dialog } from "../ui-client";
import { buttonClass } from "../ui";

type Client = NonNullable<React.ComponentProps<typeof ClientForm>["client"]>;

/** "Edit" button that opens the client form in a dialog. */
export function EditClientDialog({ action, client }: { action: (formData: FormData) => Promise<void>; client: Client }) {
  const [open, setOpen] = useState(false);
  // A fresh form each time the dialog opens, so abandoned edits do not linger.
  const [version, setVersion] = useState(0);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setVersion((v) => v + 1);
          setOpen(true);
        }}
        className={buttonClass("secondary", "sm")}
      >
        <Pencil size={14} aria-hidden /> Edit
      </button>
      <Dialog open={open} onClose={close} title="Edit client" description={client.company_name} wide>
        <ClientForm key={version} action={action} client={client} onCancel={close} onSaved={close} />
      </Dialog>
    </>
  );
}
