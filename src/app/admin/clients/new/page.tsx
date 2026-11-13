import { redirect } from "next/navigation";
import { ClientForm } from "@/components/admin/ClientForm";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "../actions";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createClient(formData);
  redirect(id ? `/admin/clients/${id}` : "/admin/clients");
}

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="New client"
        description="Three short sections. Only the company name and one contact are required; everything can be changed later."
        back={{ href: "/admin/clients", label: "Clients" }}
      />
      <ClientForm action={handleCreate} cancelHref="/admin/clients" />
    </div>
  );
}
