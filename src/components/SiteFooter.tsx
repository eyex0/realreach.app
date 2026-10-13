import { Link } from "react-router-dom"
import { BrandLogo } from "./ui"

const links = [
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["Pricing", "/pricing"],
  ["Coverage", "/coverage"],
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Sign in", "/login"],
  ["Create an account", "/register"],
  ["Platform preview", "/dashboard"],
] as const

export default function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-main">
    <div className="footer-brand"><Link to="/" aria-label="RealReach, home"><BrandLogo inverse /></Link><p>Planning and coordinating printed-leaflet distribution for local campaigns in Milan, with clear steps and scope agreed before delivery.</p></div>
    <div><p className="footer-title">Explore</p><nav className="footer-links" aria-label="Site links">{links.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</nav></div>
    <div><p className="footer-title">Contact</p><div className="footer-links"><a href="mailto:hello@realreach.it">hello@realreach.it</a><span>Milan, Italy</span><span>Print and distribution are coordinated around each campaign scope.</span></div></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} RealReach. All rights reserved.</span><span>Local distribution services in Milan</span></div></footer>
}
