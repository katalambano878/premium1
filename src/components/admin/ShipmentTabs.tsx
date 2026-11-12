"use client";

import { useState } from "react";
import { DollarSign, FileText, MapPin, MessageSquare } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: MapPin },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "activity", label: "Activity", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ShipmentTabs({
  overviewContent,
  documentsContent,
  financeContent,
  activityContent,
}: {
  overviewContent: React.ReactNode;
  documentsContent: React.ReactNode;
  financeContent: React.ReactNode;
  activityContent: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("overview");

  const content: Record<TabId, React.ReactNode> = {
    overview: overviewContent,
    documents: documentsContent,
    finance: financeContent,
    activity: activityContent,
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5">{content[active]}</div>
    </div>
  );
}
