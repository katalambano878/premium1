import { redirect } from "next/navigation";
import { ClientForm } from "@/components/admin/ClientForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { createClient } from "../actions";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createClient(formData);
  redirect(id ? `/admin/clients/${id}` : "/admin/clients");
}

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New client"
        description="Add the company and the person we deal with. You can change any of this later."
        back={{ href: "/admin/clients", label: "Clients" }}
      />
      <Card>
        <ClientForm action={handleCreate} cancelHref="/admin/clients" />
      </Card>
    </div>
  );
}
