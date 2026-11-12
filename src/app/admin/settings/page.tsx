import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireRole } from "@/lib/auth/session";
import { ensure, id, text } from "@/lib/admin-form";
import { isEmail } from "@/lib/forms";
import { logActivity } from "@/lib/activity";

async function updateSettings(formData: FormData) {
  "use server";
  await requireRole("settings");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const email = text(formData, "email", 200);
  if (email && !isEmail(email)) throw new Error("Enter a valid email address.");
  ensure(
    await supabase
      .from("site_settings")
      .update({
        company_name: text(formData, "company_name", 200),
        email,
        phone: text(formData, "phone", 40),
        address: text(formData, "address", 500),
        whatsapp: text(formData, "whatsapp", 40),
        tagline: text(formData, "tagline", 300),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id(formData)),
    "save the settings",
  );
  await logActivity({ entityType: "settings", action: "updated company settings" });
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).single();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Company information and preferences</p>
      </div>

      {settings ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Company Information</h2>
          <SettingsForm settings={settings} action={updateSettings} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-500 text-sm">No company settings record yet. It is created automatically on the next deploy.</p>
        </div>
      )}

      {/* System Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">System</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Platform</span>
            <span className="font-medium text-slate-800">Premium 1 Operations Management System</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Framework</span>
            <span className="font-medium text-slate-800">Next.js + PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Keyboard Shortcuts</span>
            <span className="font-medium text-slate-800">⌘K — Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
