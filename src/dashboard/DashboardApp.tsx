import { useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import { ProtectedWorkspace } from "../auth/AuthGate"
import type { DashboardRole } from "./config"
import DashboardLanding from "./DashboardLanding"
import DashboardLayout from "./DashboardLayout"
import {
  AdminCampaigns,
  AdminCustomers,
  AdminDistributors,
  AdminEvidence,
  AdminOrders,
  AdminOverview,
  AdminReports,
  CreateCampaignPage,
  CustomerCampaignHistory,
  CustomerOrderDetails,
  CustomerOrders,
  CustomerOverview,
  CustomerReports,
  CustomerSettings,
  DeliveryProgress,
  DistributorJobDetails,
  DistributorJobs,
  DistributorOverview,
  DistributorSettings,
  ProofOfDelivery,
} from "./DashboardPages"

const roles = new Set<DashboardRole>(["customer", "distributor", "admin"])

export default function DashboardApp() {
  const location = useLocation()
  const { profile, status } = useAuth()
  useEffect(() => {
    if (location.pathname === "/dashboard") document.title = "RealReach workspace access"
  }, [location.pathname])

  if (location.pathname === "/dashboard") {
    if (status === "signedIn" && profile) return <Navigate to={`/dashboard/${profile.role}`} replace />
    return <DashboardLanding />
  }

  const roleName = location.pathname.split("/")[2] as DashboardRole | undefined
  if (!roleName || !roles.has(roleName)) return <Navigate to="/dashboard" replace />

  return <ProtectedWorkspace role={roleName}>
    <Routes>
      <Route path="customer" element={<DashboardLayout role="customer" />}>
        <Route index element={<CustomerOverview />} />
        <Route path="overview" element={<CustomerOverview />} />
        <Route path="campaigns/new" element={<CreateCampaignPage />} />
        <Route path="campaigns" element={<CustomerCampaignHistory />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="order-details" element={<CustomerOrderDetails />} />
        <Route path="orders/:orderId" element={<CustomerOrderDetails />} />
        <Route path="reports" element={<CustomerReports />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>
      <Route path="distributor" element={<DashboardLayout role="distributor" />}>
        <Route index element={<DistributorOverview />} />
        <Route path="overview" element={<DistributorOverview />} />
        <Route path="jobs" element={<DistributorJobs />} />
        <Route path="jobs/:jobId" element={<DistributorJobDetails />} />
        <Route path="job-details" element={<DistributorJobDetails />} />
        <Route path="progress" element={<DeliveryProgress />} />
        <Route path="proof" element={<ProofOfDelivery />} />
        <Route path="settings" element={<DistributorSettings />} />
      </Route>
      <Route path="admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<AdminOverview />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="distributors" element={<AdminDistributors />} />
        <Route path="evidence" element={<AdminEvidence />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
      <Route path="*" element={<Navigate to={`/dashboard/${roleName}`} replace />} />
    </Routes>
  </ProtectedWorkspace>
}
