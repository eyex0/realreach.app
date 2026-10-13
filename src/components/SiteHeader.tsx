import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { ActionLink, BrandLogo } from "./ui"

const navigation = [
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["Coverage", "/coverage"],
  ["Pricing", "/pricing"],
  ["About", "/about"],
  ["Platform preview", "/dashboard"],
] as const

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <>{navigation.map(([label, path]) => <NavLink key={path} to={path} onClick={onNavigate} className="header-link">{label}</NavLink>)}</>
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])
  return <>
    <a className="skip-link" href="#main-content" onClick={() => document.getElementById("main-content")?.focus()}>Skip to content</a>
    <header className="site-header"><div className="container header-inner">
      <Link to="/" aria-label="RealReach, home"><BrandLogo /></Link>
      <nav className="header-nav" aria-label="Main navigation"><NavigationLinks /></nav>
      <div className="header-actions"><Link className="button button--quiet" to="/login">Sign in</Link><ActionLink to="/contact" className="header-cta">Plan a campaign</ActionLink></div>
      <button type="button" className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>{menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><NavigationLinks onNavigate={() => setMenuOpen(false)} /><NavLink className="header-link" to="/login" onClick={() => setMenuOpen(false)}>Sign in</NavLink><ActionLink to="/contact" onClick={() => setMenuOpen(false)}>Plan a campaign</ActionLink></nav>}</header>
  </>
}
