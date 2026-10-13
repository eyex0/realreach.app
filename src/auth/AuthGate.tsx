import type { ReactNode } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react"
import { BrandLogo, Card } from "../components/ui"
import { roleDetails, type DashboardRole } from "../dashboard/config"
import { useAuth } from "./AuthProvider"

function AccessState({ title, description, loading = false, onRetry }: { title: string; description: string; loading?: boolean; onRetry?: () => void }) {
  return <div className="workspace auth-state-shell">
    <header className="workspace-topbar"><div className="container workspace-topbar-inner"><Link className="workspace-brand" to="/" aria-label="RealReach home"><BrandLogo /></Link><Link className="workspace-return" to="/">Public site <ArrowRight size={15} aria-hidden="true" /></Link></div></header>
    <main className="container auth-state-content">
      <Card className="auth-state-card" role={loading ? "status" : "alert"}>
        <span className="auth-state-icon">{loading ? <LoaderCircle size={22} className="auth-spinner" aria-hidden="true" /> : <ShieldCheck size={22} aria-hidden="true" />}</span>
        <p className="eyebrow">RealReach account access</p>
        <h1>{title}</h1>
        <p className="body-copy">{description}</p>
        {onRetry && <button className="button button--secondary" type="button" onClick={onRetry}>Try again</button>}
        <p className="auth-state-links"><Link to="/login">Sign in</Link><span aria-hidden="true">·</span><Link to="/">Return to the public site</Link></p>
      </Card>
    </main>
  </div>
}

export function ProtectedWorkspace({ role, children }: { role: DashboardRole; children: ReactNode }) {
  const location = useLocation()
  const { status, profile, error, refreshProfile } = useAuth()

  if (status === "unconfigured") {
    return <AccessState title="Supabase setup required" description="This workspace stays protected until the Supabase project URL, publishable key, and RealReach database migration are configured. No dashboard data has been loaded." />
  }
  if (status === "loading" || status === "loadingProfile") {
    return <AccessState title="Checking your account" description="RealReach is verifying the saved session and role before opening this workspace." loading />
  }
  if (status === "error") {
    return <AccessState title="We could not verify your access" description={error ?? "Your account role could not be verified. Dashboard access is blocked."} onRetry={refreshProfile} />
  }
  if (status === "signedOut" || !profile) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(returnTo)}`} replace />
  }
  if (profile.role !== role) {
    return <Navigate to={roleDetails[profile.role].basePath} replace />
  }
  return children
}
