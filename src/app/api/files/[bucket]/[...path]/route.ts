import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { objectResponseHeaders, readObject } from "@/lib/db/storage";

const BUCKETS = new Set(["inquiry-uploads", "shipment-documents"]);

// Staff-only download of client and shipment documents.
export async function GET(_request: Request, { params }: { params: Promise<{ bucket: string; path: string[] }> }) {
  const staff = await getSessionUser();
  if (!staff) return new NextResponse("Sign in required", { status: 401 });
  const { bucket, path } = await params;
  if (!BUCKETS.has(bucket) || !path?.length || path.some((p) => p === ".." || p.includes("\0"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const object = await readObject(bucket, path.map(decodeURIComponent).join("/"));
  if (!object) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(object.bytes), {
    headers: { ...objectResponseHeaders(object.contentType), "Cache-Control": "private, no-store" },
  });
}
