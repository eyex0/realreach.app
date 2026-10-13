import { Check, Clock3, ClipboardList, Layers3, Printer, Route, Users, type LucideIcon } from "lucide-react"

export type DashboardRole = "customer" | "distributor" | "admin"

export type DashboardNavItem = {
  label: string
  path: string
  icon: LucideIcon
  activePrefix?: string
}

export const roleDetails: Record<DashboardRole, { label: string; summary: string; basePath: string }> = {
  customer: { label: "Customer", summary: "Plan campaigns and review related orders.", basePath: "/dashboard/customer" },
  distributor: { label: "Distributor", summary: "Review assigned work and delivery steps.", basePath: "/dashboard/distributor" },
  admin: { label: "Administrator", summary: "Review platform operations and records.", basePath: "/dashboard/admin" },
}

export const roleNavigation: Record<DashboardRole, DashboardNavItem[]> = {
  customer: [
    { label: "Overview", path: "/dashboard/customer", icon: Layers3 },
    { label: "Create campaign", path: "/dashboard/customer/campaigns/new", icon: Route },
    { label: "Campaign history", path: "/dashboard/customer/campaigns", icon: Clock3 },
    { label: "Orders", path: "/dashboard/customer/orders", icon: ClipboardList },
    { label: "Order details", path: "/dashboard/customer/order-details", icon: ClipboardList, activePrefix: "/dashboard/customer/orders/" },
    { label: "Distribution reports", path: "/dashboard/customer/reports", icon: Check },
    { label: "Account settings", path: "/dashboard/customer/settings", icon: Users },
  ],
  distributor: [
    { label: "Overview", path: "/dashboard/distributor", icon: Layers3 },
    { label: "Assigned jobs", path: "/dashboard/distributor/jobs", icon: Route },
    { label: "Job details", path: "/dashboard/distributor/job-details", icon: ClipboardList, activePrefix: "/dashboard/distributor/jobs/" },
    { label: "Delivery progress", path: "/dashboard/distributor/progress", icon: Clock3 },
    { label: "Proof of delivery", path: "/dashboard/distributor/proof", icon: Check },
    { label: "Account settings", path: "/dashboard/distributor/settings", icon: Users },
  ],
  admin: [
    { label: "Overview", path: "/dashboard/admin", icon: Layers3 },
    { label: "Campaign management", path: "/dashboard/admin/campaigns", icon: Route },
    { label: "Customer management", path: "/dashboard/admin/customers", icon: Users },
    { label: "Distributor management", path: "/dashboard/admin/distributors", icon: Users },
    { label: "Review delivery evidence", path: "/dashboard/admin/evidence", icon: Check },
    { label: "Orders", path: "/dashboard/admin/orders", icon: ClipboardList },
    { label: "Reports", path: "/dashboard/admin/reports", icon: Printer },
  ],
}
