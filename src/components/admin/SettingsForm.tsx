"use client";

import { useTransition } from "react";
import { toast } from "sonner";

export function SettingsForm({
  settings,
  action,
}: {
  settings: Record<string, string>;
  action: (fd: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", settings.id);
    startTransition(async () => {
      await action(fd);
      toast.success("Settings updated");
    });
  };

  const inputClass = "w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Company Name</label>
          <input name="company_name" defaultValue={settings.company_name || ""} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email</label>
          <input name="email" type="email" defaultValue={settings.email || ""} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone</label>
          <input name="phone" defaultValue={settings.phone || ""} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">WhatsApp</label>
          <input name="whatsapp" defaultValue={settings.whatsapp || ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Address</label>
        <input name="address" defaultValue={settings.address || ""} className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tagline</label>
        <input name="tagline" defaultValue={settings.tagline || ""} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
      >
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
