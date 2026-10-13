import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from "react"
import type { HTMLAttributes } from "react"
import { ArrowRight, Check } from "lucide-react"
import { Link } from "react-router-dom"

export function Container({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`container ${className}`} style={style}>{children}</div>
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "inverse" | "quiet" }) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>
}

export function ActionLink({ to, children, variant = "primary", className = "", showArrow = true, onClick }: { to: string; children: ReactNode; variant?: "primary" | "secondary" | "inverse" | "quiet"; className?: string; showArrow?: boolean; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  const content = <>{children}{showArrow && <ArrowRight aria-hidden="true" />}</>
  const classes = `button button--${variant} ${className}`
  return to.startsWith("mailto:") || to.startsWith("https:") ? <a className={classes} href={to} onClick={onClick}>{content}</a> : <Link className={classes} to={to} onClick={onClick}>{content}</Link>
}

export function PageIntro({ eyebrow, title, description, className = "" }: { eyebrow: string; title: string; description: string; className?: string }) {
  return <div className={`section-heading ${className}`}><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{description}</p></div>
}

export function SectionHeading({ eyebrow, title, description, centered = false }: { eyebrow: string; title: string; description?: string; centered?: boolean }) {
  return <div className={`section-heading${centered ? " section-heading--center" : ""}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="lead">{description}</p>}</div>
}

export function Card({ children, className = "", style, role }: { children: ReactNode; className?: string; style?: CSSProperties; role?: HTMLAttributes<HTMLElement>["role"] }) {
  return <section className={`card ${className}`} style={style} role={role}>{children}</section>
}

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brand${inverse ? " brand--inverse" : ""}`}><img src="/realreach-mark.svg" alt="" aria-hidden="true" /><span className="brand-name">RealReach</span></span>
}

export function IconTile({ children }: { children: ReactNode }) {
  return <span className="icon-tile" aria-hidden="true">{children}</span>
}

export function Checklist({ items }: { items: string[] }) {
  return <ul className="bullet-list">{items.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul>
}

export function MilanDiagram() {
  return (
    <section className="coverage-visual" aria-label="Interactive OpenStreetMap reference for Milan">
      <div className="coverage-header">
        <div><p>Starting area</p><strong>Milan</strong></div>
        <span className="tag">Planned per campaign</span>
      </div>
      <iframe
        className="coverage-map-frame"
        title="Interactive street map centered on Milan, Italy"
        src="https://www.openstreetmap.org/export/embed.html?bbox=9.135%2C45.435%2C9.245%2C45.495&layer=mapnik&marker=45.4642%2C9.19"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="coverage-map-footer">
        <span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. The marker is central Milan, not a confirmed service boundary.</span>
        <a href="https://www.openstreetmap.org/?mlat=45.4642&mlon=9.19#map=13/45.4642/9.19" target="_blank" rel="noreferrer">Open map in a new tab</a>
      </div>
    </section>
  )
}
