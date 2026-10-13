import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { MotionConfig } from "framer-motion"
import SiteFooter from "./components/SiteFooter"
import SiteHeader from "./components/SiteHeader"
import { ActionLink, PageIntro } from "./components/ui"
import AboutPage, { CoveragePage, HowItWorksPage, PricingPage, ServicesPage } from "./pages/ContentPages"
import ContactPage from "./pages/ContactPage"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import DashboardApp from "./dashboard/DashboardApp"

const pageTitles: Record<string, string> = {
  "/": "RealReach — Leaflet distribution in Milan",
  "/services": "Services | RealReach",
  "/how-it-works": "How it works | RealReach",
  "/pricing": "Pricing | RealReach",
  "/coverage": "Coverage | RealReach",
  "/about": "About | RealReach",
  "/contact": "Contact | RealReach",
  "/login": "Sign in | RealReach",
  "/register": "Create an account | RealReach",
}

function RouteEffects() {
  const location = useLocation()
  useEffect(() => {
    document.title = pageTitles[location.pathname] ?? (location.pathname.startsWith("/dashboard") ? "RealReach protected workspace" : "RealReach — Milan")
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [location.pathname])
  return null
}

function NotFoundPage() {
  return <section className="page-section"><div className="container narrow-container"><PageIntro eyebrow="Page not found" title="Let’s get back on track." description="This address does not match a page in the RealReach website." /><ActionLink to="/" variant="primary">Return to the homepage</ActionLink></div></section>
}

function AppRoutes() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith("/dashboard")
  return <>
    <RouteEffects />
    {isDashboard ? <Routes><Route path="/dashboard/*" element={<DashboardApp />} /></Routes> : <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/coverage" element={<CoveragePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes></main>
      <SiteFooter />
    </>}
  </>
}

export default function App() {
  return <MotionConfig reducedMotion="user"><BrowserRouter><AppRoutes /></BrowserRouter></MotionConfig>
}
