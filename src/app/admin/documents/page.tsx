import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Download, Eye, File, FileText, Image as ImageIcon } from "lucide-react";
import { DocumentUpload } from "@/components/admin/DocumentUpload";

const DOC_TYPE_ICONS: Record<string, string> = {
  bill_of_lading: "B/L",
  commercial_invoice: "CI",
  packing_list: "PL",
  certificate_of_origin: "CO",
  customs_declaration: "CD",
  insurance_certificate: "IC",
  delivery_note: "DN",
  other: "OT",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  bill_of_lading: "bg-blue-100 text-blue-700",
  commercial_invoice: "bg-emerald-100 text-emerald-700",
  packing_list: "bg-amber-100 text-amber-700",
  customs_declaration: "bg-purple-100 text-purple-700",
  insurance_certificate: "bg-cyan-100 text-cyan-700",
  delivery_note: "bg-orange-100 text-orange-700",
  certificate_of_origin: "bg-rose-100 text-rose-700",
  other: "bg-slate-100 text-slate-600",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  const [docsResult, shipmentsResult] = await Promise.all([
    (() => {
      let q = supabase
        .from("shipment_documents")
        .select("id, doc_type, file_url, shipment_id, shipments(shipment_no), created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (params.type) q = q.eq("doc_type", params.type);
      return q;
    })(),
    supabase
      .from("shipments")
      .select("id, shipment_no")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const docs = docsResult.data;
  const shipments = shipmentsResult.data || [];

  const filtered = params.q
    ? (docs || []).filter((d) => {
        const ship = Array.isArray(d.shipments) ? d.shipments[0] : d.shipments;
        const filename = d.file_url?.split("/").pop() || "";
        return (
          filename.toLowerCase().includes(params.q!.toLowerCase()) ||
          ship?.shipment_no?.toLowerCase().includes(params.q!.toLowerCase()) ||
          d.doc_type?.toLowerCase().includes(params.q!.toLowerCase())
        );
      })
    : docs || [];

  const typeCounts: Record<string, number> = {};
  (docs || []).forEach((d) => {
    typeCounts[d.doc_type] = (typeCounts[d.doc_type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Vault</h1>
          <p className="text-sm text-slate-500 mt-0.5">{docs?.length || 0} documents</p>
        </div>
        <DocumentUpload shipments={shipments} />
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/admin/documents"
          className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
            !params.type ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"
          }`}
        >
          All ({docs?.length || 0})
        </Link>
        {Object.entries(typeCounts).map(([type, count]) => (
          <Link
            key={type}
            href={params.type === type ? "/admin/documents" : `/admin/documents?type=${type}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
              params.type === type
                ? DOC_TYPE_COLORS[type] || "bg-slate-100 text-slate-600"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <span className="capitalize">{type.replace(/_/g, " ")}</span>
            <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-md">{count}</span>
          </Link>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((d) => {
            const ship = Array.isArray(d.shipments) ? d.shipments[0] : d.shipments;
            const filename = d.file_url?.split("/").pop() || "Document";
            const ext = filename.split(".").pop()?.toLowerCase();
            const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
            const isPdf = ext === "pdf";

            return (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-slate-900/5 transition-all group"
              >
                {/* Preview Area */}
                <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  {isImage ? (
                    <ImageIcon size={32} className="text-slate-300" />
                  ) : isPdf ? (
                    <FileText size={32} className="text-red-300" />
                  ) : (
                    <File size={32} className="text-slate-300" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{filename}</p>
                      {ship?.shipment_no && (
                        <Link href={`/admin/shipments/${d.shipment_id}`} className="text-[11px] text-[var(--accent)] hover:underline">
                          {ship.shipment_no}
                        </Link>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${DOC_TYPE_COLORS[d.doc_type] || DOC_TYPE_COLORS.other}`}>
                      {DOC_TYPE_ICONS[d.doc_type] || d.doc_type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>

                  <div className="flex gap-2">
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Eye size={12} /> View
                    </a>
                    <a
                      href={d.file_url}
                      download
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No documents found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
