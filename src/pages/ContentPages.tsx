import { ArrowRight, MapPin, Printer, Route, Users, ClipboardList, Check } from "lucide-react"
import { ActionLink, Card, Container, IconTile, MilanDiagram, PageIntro, SectionHeading } from "../components/ui"

function PageHero({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside: string }) {
  return <section className="page-hero"><Container className="page-hero-grid"><PageIntro eyebrow={eyebrow} title={title} description={description} /><p className="page-aside">{aside}</p></Container></section>
}

function NextStep({ title, description, to = "/contact" }: { title: string; description: string; to?: string }) {
  return <section className="section" style={{ paddingBottom: 0 }}><Container><div className="cta-band"><h2>{title}</h2><p>{description}</p><ActionLink to={to} variant="inverse" showArrow={false}>Plan a campaign <ArrowRight aria-hidden="true" /></ActionLink></div></Container></section>
}

const services = [
  { icon: Route, title: "Leaflet distribution", description: "Plan distribution around the area, audience, timing, and campaign goal.", details: ["Define the target area and goal", "Review quantity and timing", "Coordinate delivery within the agreed scope"] },
  { icon: Printer, title: "Print coordination", description: "If materials are not ready, print requirements can be discussed alongside the distribution plan.", details: ["Review print requirements", "Agree specifications", "Coordinate print and distribution as one plan"] },
  { icon: MapPin, title: "Campaign area planning", description: "Choose an area that fits the campaign and practical delivery conditions in Milan, rather than a fixed-radius assumption.", details: ["Central Milan and nearby areas", "Residential or commercial-area planning", "Confirm the area during the inquiry"] },
]

export function ServicesPage() {
  return <>
    <PageHero eyebrow="Services" title="Clear distribution services, from print to neighbourhood." description="Bring planning, leaflet distribution, and print coordination together according to what your Milan campaign needs." aside="You can start with printed materials that are ready to go, or discuss print requirements as part of the campaign. Scope and details are reviewed before delivery is agreed." />
    <section className="section"><Container><div className="grid-3">{services.map(({ icon: Icon, title, description, details }) => <Card className="card-pad feature-card" key={title}><IconTile><Icon /></IconTile><h3>{title}</h3><p className="body-copy">{description}</p><ul className="bullet-list" style={{ marginTop: 20, gap: 10 }}>{details.map((detail) => <li key={detail}><Check aria-hidden="true" /><span>{detail}</span></li>)}</ul></Card>)}</div></Container></section>
    <section className="section section--white"><Container className="split-layout"><div><SectionHeading eyebrow="Campaign scope" title="One service, with clear options." description="Plan distribution on its own or discuss print coordination alongside it. No fixed packages are assumed; each scope is discussed around your needs." /><div style={{ marginTop: 24 }}><ActionLink to="/how-it-works" variant="secondary">See how it works</ActionLink></div></div><Card className="card-pad"><p className="eyebrow">What we coordinate</p><h3>Details to agree before delivery</h3><ul className="bullet-list">{["Area and target audience", "Material type, format, and quantity", "Print needs, if any", "Timing and practical conditions"].map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul></Card></Container></section>
    <NextStep title="Have a campaign in mind?" description="Start with your goal and preferred area; we’ll discuss a practical scope for the next step." />
  </>
}

const steps = [
  ["01", "Share the goal", "Tell us about your business, audience, preferred area, and whether you need print coordination."],
  ["02", "Define a practical scope", "We review the area, quantity, timing, access conditions, and what is included before the scope is agreed."],
  ["03", "Prepare the materials", "Provide printed leaflets or discuss print coordination before distribution."],
  ["04", "Deliver and close the task", "The campaign close-out is communicated clearly. This site does not provide live tracking or GPS updates."],
] as const

export function HowItWorksPage() {
  return <>
    <PageHero eyebrow="How it works" title="Every campaign starts with a clear scope." description="We turn a local campaign goal into a practical distribution plan, reviewing details before delivery rather than making broad promises." aside="These steps describe the proposed planning process. This website is not connected to campaign-management software or live distributor tracking." />
    <section className="section section--warm"><Container><div className="grid-4">{steps.map(([number, title, description]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></Container></section>
    <section className="section"><Container className="split-layout"><div><SectionHeading eyebrow="Clarity before delivery" title="Agree what is included before the campaign begins." description="Area, quantity, timing, and print coordination are reviewed within the campaign scope. No live tracking or unconnected performance reports are presented here." /></div><Card className="card-pad"><h3>Details reviewed together</h3><ul className="bullet-list">{["Goal and audience", "Coverage area", "Quantity and material type", "Print needs and timing", "How the task will be closed out"].map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul></Card></Container></section>
    <NextStep title="Start with your goal, not a preset package." description="Tell us what you want to distribute and where, and we’ll discuss a sensible next step." />
  </>
}

const priceFactors = [
  ["Location", "The selected area and the scope of coverage requested."],
  ["Quantity and format", "The number of leaflets and their format or size."],
  ["Timing", "The requested schedule and duration."],
  ["Print", "Whether materials are ready or print coordination is needed."],
  ["Access conditions", "Practical requirements that may affect the campaign scope."],
] as const

export function PricingPage() {
  return <>
    <PageHero eyebrow="Pricing" title="A clear estimate, based on campaign details." description="Distribution needs vary by activity, so we explain the factors that shape an estimate and clarify the scope before commitment." aside="No approved rate card or package data was provided, so this page does not invent fixed prices, packages, or promotions." />
    <section className="section"><Container className="split-layout"><div><SectionHeading eyebrow="Estimate factors" title="What goes into a campaign estimate?" description="These are the details to discuss when requesting an estimate. Start with what you know; the remaining details can be clarified together." /></div><div className="grid-2">{priceFactors.map(([title, description]) => <Card className="card-pad" key={title}><h3>{title}</h3><p className="body-copy" style={{ margin: 0 }}>{description}</p></Card>)}</div></Container></section>
    <section className="section section--white"><Container className="narrow-container"><SectionHeading eyebrow="Before confirmation" title="Review the scope before you commit." description="An estimate should state the area, quantity, format, timing, and any print coordination. Review those details before deciding whether to proceed." /><div className="note" style={{ marginTop: 28 }}>This page does not include an instant price calculator, online payment, or a campaign request connected to a backend.</div></Container></section>
    <NextStep title="Discuss an estimate for your campaign." description="Send an inquiry by email. The website form prepares a draft on your device only." />
  </>
}

export function CoveragePage() {
  return <>
    <PageHero eyebrow="Coverage" title="Starting from Milan." description="We plan distribution in central Milan and nearby areas, reviewing the proposed scope for each campaign." aside="The interactive OpenStreetMap shows central Milan as a geographic reference, not confirmed service boundaries or live coverage. Ask us to verify a specific area for your campaign." />
    <section className="section"><Container className="split-layout"><div><SectionHeading eyebrow="Plan around the goal" title="The right area depends on your audience." description="We start from the business, audience, and practical conditions, then discuss a useful scope rather than assuming a fixed radius." /><ul className="bullet-list" style={{ marginTop: 22 }}>{["Central Milan and nearby areas", "Planning for residential or commercial areas", "Ask about a specific location", "Confirm the scope before a campaign begins"].map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul></div><MilanDiagram /></Container></section>
    <section className="section section--warm"><Container className="narrow-container"><SectionHeading eyebrow="A specific location?" title="Ask about the area that matters to you." description="There is no live coverage checker on this site. Share a location and we can discuss whether it fits the campaign scope." /><div style={{ marginTop: 26 }}><ActionLink to="/contact" variant="secondary">Ask about coverage</ActionLink></div></Container></section>
  </>
}

export default function AboutPage() {
  return <>
    <PageHero eyebrow="About" title="A clearer link between local businesses and field distribution." description="RealReach is a Milan-based leaflet distribution concept intended to coordinate business needs with a practical campaign plan." aside="No team, partner, or delivery achievement details were supplied, so this page describes the service and intended platform model without inventing them." />
    <section className="section"><Container className="split-layout"><div><SectionHeading eyebrow="Our purpose" title="Make leaflet distribution easier to plan." description="A useful local campaign starts with a clear scope: what to distribute, for whom, where, and when." /><p className="body-copy" style={{ marginTop: 18 }}>RealReach aims to bring campaign planning, print coordination, and distribution into a straightforward experience for businesses in Milan, with a future platform model for independent distributors and administrators.</p></div><Card className="card-pad"><p className="eyebrow">The RealReach model</p><div className="grid-2" style={{ marginTop: 15 }}>{[[Users, "Businesses", "Set the goal, area, and materials."], [Route, "Independent distributors", "Carry out distribution tasks within the agreed scope."], [ClipboardList, "Administrators", "Coordinate campaigns and operations."]].map(([Icon, title, copy]) => { const RoleIcon = Icon as typeof Users; return <div key={title as string}><IconTile><RoleIcon /></IconTile><h3 style={{ marginTop: 15 }}>{title as string}</h3><p className="body-copy" style={{ margin: 0, fontSize: ".9rem" }}>{copy as string}</p></div> })}</div><p className="note" style={{ marginTop: 22 }}>The platform backend and account management are not connected in this public-site version.</p></Card></Container></section>
    <NextStep title="Want to explore what fits your business?" description="Start a conversation about your goal, area, and the materials you would like to distribute." />
  </>
}
