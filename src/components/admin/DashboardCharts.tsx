"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Enquiries received per month (single navy series; the newest month is the last bar). */
export function DashboardCharts({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.every((d) => d.value === 0)) {
    return <div className="flex h-[200px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">No enquiries in the last six months.</div>;
  }

  return (
    <div className="h-[200px] w-full" role="img" aria-label={`Enquiries per month: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(11,31,58,0.05)" }}
            formatter={(value) => [value, "Enquiries"]}
            contentStyle={{ background: "#0b1f3a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, padding: "6px 10px" }}
            labelStyle={{ color: "rgba(255,255,255,0.75)" }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar dataKey="value" fill="#0b1f3a" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
