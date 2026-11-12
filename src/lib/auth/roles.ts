export type StaffRole = "admin" | "operations" | "documentation" | "customer_service";

const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  admin: ["inquiries", "shipments", "customs", "documents", "clients", "finance", "staff", "settings"],
  operations: ["inquiries", "shipments", "customs", "documents", "clients", "finance"],
  documentation: ["documents", "customs", "shipments:read", "clients:read"],
  customer_service: ["inquiries", "clients"],
};

export function canAccess(role: StaffRole, resource: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(resource) || perms.includes(`${resource}:read`);
}

export function canWrite(role: StaffRole, resource: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(resource);
}

export function getNavItems(role: StaffRole) {
  const all = [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", resource: "" },
    { href: "/admin/inquiries", label: "Enquiries", icon: "Inbox", resource: "inquiries" },
    { href: "/admin/shipments", label: "Shipments", icon: "Truck", resource: "shipments" },
    { href: "/admin/customs", label: "Customs", icon: "ClipboardCheck", resource: "customs" },
    { href: "/admin/documents", label: "Documents", icon: "FileText", resource: "documents" },
    { href: "/admin/clients", label: "Clients", icon: "Users", resource: "clients" },
    { href: "/admin/finance", label: "Finance", icon: "DollarSign", resource: "finance" },
    { href: "/admin/staff", label: "Staff", icon: "Shield", resource: "staff" },
    { href: "/admin/settings", label: "Settings", icon: "Settings", resource: "settings" },
  ];
  return all.filter((n) => !n.resource || canAccess(role, n.resource));
}

export const ROLE_INFO: Record<StaffRole, { label: string; summary: string }> = {
  admin: { label: "Admin", summary: "Everything, including staff, settings and finance." },
  operations: { label: "Operations", summary: "Enquiries, shipments, customs, documents, clients and finance." },
  documentation: { label: "Documentation", summary: "Customs and documents. Can view shipments and clients." },
  customer_service: { label: "Customer service", summary: "Enquiries and clients only." },
};

/** "New …" shortcuts this role may use. */
export function getCreateItems(role: StaffRole) {
  const all = [
    { href: "/admin/shipments/new", label: "New shipment", resource: "shipments" },
    { href: "/admin/clients/new", label: "New client", resource: "clients" },
    { href: "/admin/finance/new", label: "New invoice", resource: "finance" },
    { href: "/admin/customs/new", label: "New declaration", resource: "customs" },
  ];
  return all.filter((i) => canWrite(role, i.resource)).map(({ href, label }) => ({ href, label }));
}
