import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, ChevronDown, Clock3, Layers3, MapPin, Pause, Play, Printer, Route, ShieldCheck } from "lucide-react"
import { ActionLink, Card, Container, IconTile, MilanDiagram, SectionHeading } from "../components/ui"

const offerings = [
  { icon: Route, label: "Distribution", title: "Planned around your area", description: "Plan leaflet distribution around location, audience, timing, and local business needs." },
  { icon: Printer, label: "Print", title: "Print coordination when needed", description: "If your materials are ready, we can plan distribution. If not, we can coordinate print specifications first." },
  { icon: MapPin, label: "Planning", title: "A clear scope before work begins", description: "We review the area, quantity, and practical details so the campaign steps are clear before launch." },
]

const steps = [
  ["Share your goal", "Tell us about your business, audience, preferred area, and whether you need print coordination."],
  ["Define the campaign scope", "We review coverage, quantities, timing, and practical requirements before a plan is agreed."],
  ["Prepare the materials", "Bring printed materials or discuss print coordination as part of the campaign."],
  ["Deliver and close the campaign", "After distribution, the agreed close-out is shared clearly. Live tracking is not available in this preview."],
] as const

const questions = [
  ["Which areas do you cover?", "We plan campaigns in central Milan and nearby areas. The scope is reviewed for each inquiry so timing and practical conditions are realistic."],
  ["Can printing be coordinated with distribution?", "Yes. Print and distribution can be discussed together. If your leaflets are ready, we can plan distribution only."],
  ["How is a campaign estimate determined?", "An estimate depends on the area, quantity, format, access conditions, timing, and whether print coordination is needed. The scope is discussed before commitment."],
  ["Do I need to know the exact quantity before getting in touch?", "No. Start with the campaign goal and preferred area; those details can help define a practical scope."],
] as const

function FAQList() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <div className="faq-list">
      {questions.map(([question, answer], index) => {
        const open = openIndex === index
        const contentId = `home-faq-${index}`
        return (
          <div className="faq-item" key={question}>
            <button className="faq-question" type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpenIndex(open ? null : index)}>
              <span>{question}</span><ChevronDown aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {open && <motion.div id={contentId} className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}><p>{answer}</p></motion.div>}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function ChecklistWithText({ items }: { items: string[] }) {
  return <ul className="bullet-list" style={{ marginTop: 24 }}>{items.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul>
}

export default function HomePage() {
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const [heroMotionAllowed, setHeroMotionAllowed] = useState(false)
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPreference = () => setHeroMotionAllowed(!preference.matches)
    syncPreference()
    preference.addEventListener("change", syncPreference)
    return () => preference.removeEventListener("change", syncPreference)
  }, [])

  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return
    if (!heroMotionAllowed) {
      video.pause()
      return
    }
    void video.play().catch(() => setHeroVideoPlaying(false))
  }, [heroMotionAllowed])

  const toggleHeroVideo = () => {
    const video = heroVideoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => setHeroVideoPlaying(false))
    else video.pause()
  }

  return (
    <>
      <section className="hero">
        <Container className="hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span className="tag">Printed leaflet distribution · Milan</span>
            <h1 style={{ marginTop: 23 }}>Put your message in the right neighbourhood.</h1>
            <p className="lead">We plan and coordinate leaflet distribution in Milan, from choosing an area and print needs to organising delivery.</p>
            <div className="button-row" style={{ marginTop: 30 }}>
              <ActionLink to="/contact">Plan a campaign</ActionLink>
              <ActionLink to="/coverage" variant="secondary">Explore coverage</ActionLink>
            </div>
            <div className="bullet-list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 30, gap: 10 }}>
              {["Clear scope before starting", "Print and distribution coordination", "Local planning in Milan"].map((item) => <div className="price-item" key={item}><Check aria-hidden="true" /><span>{item}</span></div>)}
            </div>
          </motion.div>
          <motion.div className="hero-image-wrap" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
            <div className="hero-image">
              <video
                ref={heroVideoRef}
                className="hero-video"
                autoPlay={heroMotionAllowed}
                muted
                loop
                playsInline
                preload="metadata"
                poster="/milan-street.jpg"
                aria-label="Silent, animated view of a vintage tram moving through central Milan"
                onPlay={() => setHeroVideoPlaying(true)}
                onPause={() => setHeroVideoPlaying(false)}
                onError={() => setHeroVideoPlaying(false)}
              >
                <source src="/milan-hero-video.mp4" type="video/mp4" />
                <img src="/milan-street.jpg" alt="A vintage tram on a Milan street" />
              </video>
              <button
                className="hero-video-toggle"
                type="button"
                aria-label={heroVideoPlaying ? "Pause homepage video" : "Play homepage video"}
                aria-pressed={heroVideoPlaying}
                onClick={toggleHeroVideo}
              >
                {heroVideoPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
              <div className="hero-caption"><strong>From Milan, for local campaigns</strong><span>Distribution planned around your area and goal.</span></div>
            </div>
            <div className="hero-float"><p>From idea to delivery</p><strong>A clear campaign plan, step by step</strong></div>
          </motion.div>
        </Container>
      </section>

      <section className="promise-strip" aria-label="Service principles">
        <Container className="promise-items">
          {[[ShieldCheck, "Professional coordination"], [Layers3, "Print and distribution"], [Clock3, "Clear timing and scope"]].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof ShieldCheck
            return <div className="promise-item" key={label as string}><ItemIcon aria-hidden="true" /><span>{label as string}</span></div>
          })}
        </Container>
      </section>

      <section className="section" id="services">
        <Container>
          <SectionHeading eyebrow="Services" title="From printed material to the customer’s door." description="Choose distribution as a standalone service or discuss print and distribution together within one clear campaign scope." />
          <div className="grid-3" style={{ marginTop: 42 }}>
            {offerings.map(({ icon: Icon, label, title, description }) => <Card className="feature-card card-pad" key={title}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><IconTile><Icon /></IconTile><span className="eyebrow" style={{ margin: 0 }}>{label}</span></div>
              <h3>{title}</h3><p>{description}</p>
            </Card>)}
          </div>
          <div style={{ marginTop: 26 }}><ActionLink to="/services" variant="quiet">Explore services</ActionLink></div>
        </Container>
      </section>

      <section className="section section--warm" id="process">
        <Container>
          <SectionHeading eyebrow="How it works" title="A clear path from inquiry to campaign close-out." description="We define the goal and scope first, then coordinate details before delivery. Live tracking and unconnected backend features are not presented as available." />
          <div className="grid-4" style={{ marginTop: 38 }}>
            {steps.map(([title, description]) => <article className="step step--unnumbered" key={title}><h3>{title}</h3><p>{description}</p></article>)}
          </div>
          <div style={{ marginTop: 24 }}><ActionLink to="/how-it-works" variant="secondary">Read the process</ActionLink></div>
        </Container>
      </section>

      <section className="section" id="coverage">
        <Container className="split-layout">
          <div>
            <SectionHeading eyebrow="Coverage" title="Campaign planning across Milan, area by area." description="We consider your audience and practical conditions rather than applying a fixed radius. Coverage is confirmed for each inquiry before a campaign is defined." />
            <ChecklistWithText items={["Central Milan and nearby areas", "Planning for residential or commercial areas", "Scope confirmed before distribution"]} />
            <div style={{ marginTop: 28 }}><ActionLink to="/coverage" variant="secondary">Explore coverage areas</ActionLink></div>
          </div>
          <MilanDiagram />
        </Container>
      </section>

      <section className="section section--white" id="pricing">
        <Container className="split-layout">
          <div>
            <SectionHeading eyebrow="Pricing" title="An estimate shaped around your campaign." description="We do not list unapproved packages or discounts. Estimates depend on campaign details, and the scope is discussed before commitment." />
            <div style={{ marginTop: 26 }}><ActionLink to="/pricing" variant="secondary">How an estimate is prepared</ActionLink></div>
          </div>
          <Card className="card-pad">
            <span className="tag">Campaign-specific estimate</span>
            <h3 style={{ marginTop: 20 }}>What we review</h3>
            <div className="price-list">{["Selected coverage area", "Leaflet quantity and format", "Distribution timing", "Print coordination needs", "Access conditions"].map((item) => <div className="price-item" key={item}><Check aria-hidden="true" /><span>{item}</span></div>)}</div>
            <div style={{ marginTop: 25 }}><ActionLink to="/contact">Discuss your campaign</ActionLink></div>
          </Card>
        </Container>
      </section>

      <section className="section">
        <Container><SectionHeading eyebrow="FAQ" title="Practical answers before you begin." centered /><FAQList /></Container>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Container>
          <div className="cta-band">
            <p className="eyebrow" style={{ color: "#fff" }}>Start a conversation</p>
            <h2>Planning a campaign in Milan?</h2>
            <p>Tell us about the area and materials you want to distribute. We’ll help define a practical next step. The contact form prepares an email draft and does not send data automatically.</p>
            <div className="button-row">
              <ActionLink to="/contact" variant="inverse">Plan a campaign</ActionLink>
              <a className="button button--quiet" style={{ color: "#fff" }} href="mailto:hello@realreach.it">hello@realreach.it <ArrowRight aria-hidden="true" /></a>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
