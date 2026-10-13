import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ExternalLink, ShieldCheck } from "lucide-react"
import { BrandLogo } from "../components/ui"
import { useAuth } from "../auth/AuthProvider"
import { roleDetails, roleNavigation, type DashboardNavItem, type DashboardRole } from "./config"

function itemIsActive(pathname: string, item: DashboardNavItem) {
  return pathname === item.path || Boolean(item.activePrefix && pathname.startsWith(item.activePrefix))
}

export default function DashboardLayout({ role }: { role: DashboardRole }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [signOutError, setSignOutError] = useState("")
  const details = roleDetails[role]
  const navigation = roleNavigation[role]
  const activeItem = navigation.find((item) => itemIsActive(location.pathname, item))
  const title = activeItem?.label ?? details.label

  useEffect(() => {
    document.title = `${title} · ${details.label} | RealReach`
  }, [title, details.label])

  async function handleSignOut() {
    setSignOutError("")
    const result = await signOut()
    if (!result.ok) {
      setSignOutError(result.message)
      return
    }
    navigate("/login", { replace: true })
  }

  return <div className="workspace">
    <header className="workspace-topbar">
      <div className="container workspace-topbar-inner">
        <Link className="workspace-brand" to="/dashboard" aria-label="RealReach workspace home"><BrandLogo /></Link>
        <div className="workspace-topbar-tools">
          <span className="preview-pill"><ShieldCheck size={15} aria-hidden="true" /> Signed in</span>
          <div className="role-switcher"><span>Verified role</span><strong>{details.label}</strong></div>
          <button className="workspace-signout" type="button" onClick={handleSignOut}>Sign out</button>
          <Link className="workspace-return" to="/" aria-label="Return to public site"><span>Public site</span><ExternalLink size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>
    <div className="container workspace-grid">
      <aside className="workspace-sidebar">
        <div className="workspace-role-card"><p className="eyebrow">Protected workspace</p><h2>{details.label}</h2><p>{details.summary}</p></div>
        <nav className="workspace-nav" aria-label={`${details.label} dashboard navigation`}>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = itemIsActive(location.pathname, item)
            return <NavLink key={item.path} to={item.path} end={item.path === details.basePath} className={`workspace-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={18} aria-hidden="true" /><span>{item.label}</span></NavLink>
          })}
        </nav>
        <p className="workspace-sidebar-note">Only the role verified for this signed-in account is available. Payments and GPS tracking are not enabled.</p>
      </aside>
      <main className="workspace-content" id="dashboard-content" tabIndex={-1}>
        <div className="workspace-page-heading"><div><p className="eyebrow">{details.label} workspace</p><h1>{title}</h1></div><span className="workspace-status"><span className="status-dot" />Authenticated session</span></div>
        {signOutError && <p className="form-status auth-message--error" role="alert">{signOutError}</p>}
        <Outlet />
      </main>
    </div>
    <footer className="workspace-footer"><div className="container"><span>RealReach · {details.label} workspace</span><span><ShieldCheck size={14} aria-hidden="true" /> Protected route · no payment processing or GPS tracking</span></div></footer>
  </div>
}
