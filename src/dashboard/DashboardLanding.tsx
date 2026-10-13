import { Link } from "react-router-dom"
import { ArrowRight, ClipboardList, Route, Users } from "lucide-react"
import { BrandLogo, Card } from "../components/ui"
import { useAuth } from "../auth/AuthProvider"
import { roleDetails, type DashboardRole } from "./config"

const roles: { role: DashboardRole; icon: typeof Users; features: string[] }[] = [
  { role: "customer", icon: Users, features: ["Campaign planning", "Orders and reports", "Account settings"] },
  { role: "distributor", icon: Route, features: ["Assigned jobs", "Delivery progress", "Proof-of-delivery interface"] },
  { role: "admin", icon: ClipboardList, features: ["Campaign and user management", "Evidence review", "Orders and reports"] },
]

export default function DashboardLanding() {
  const { configured } = useAuth()
  return <div className="workspace workspace-landing">
    <header className="workspace-topbar"><div className="container workspace-topbar-inner"><Link className="workspace-brand" to="/" aria-label="RealReach home"><BrandLogo /></Link><Link className="workspace-return" to="/">Return to public site <ArrowRight size={16} aria-hidden="true" /></Link></div></header>
    <main className="container platform-landing" id="dashboard-content">
      <div className="platform-intro"><p className="eyebrow">RealReach · Account access</p><h1>Choose a workspace to sign in.</h1><p className="lead">Each workspace opens only after RealReach verifies the signed-in account’s role. The database policies remain responsible for access to records.</p><div className="note" style={{ marginTop: 22 }}>{configured ? "Supabase credentials are present. Account access still depends on the database migration and verified role." : "Supabase is not configured in this project yet. Sign-in and protected dashboards remain unavailable until setup is complete."} Payments and GPS tracking are not enabled.</div></div>
      <div className="role-card-grid">{roles.map(({ role, icon: Icon, features }) => <Card className="role-card" key={role}><span className="icon-tile"><Icon aria-hidden="true" /></span><h2>{roleDetails[role].label}</h2><p className="body-copy">{roleDetails[role].summary}</p><ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link className="button button--primary" to={roleDetails[role].basePath}>Continue as {roleDetails[role].label} <ArrowRight size={17} aria-hidden="true" /></Link></Card>)}</div>
      <p className="platform-footnote">No sample customer, campaign, distributor, order, or delivery records are shown.</p>
    </main>
  </div>
}
