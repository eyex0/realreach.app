import { useState, type FormEvent } from "react"
import { Mail, MapPin } from "lucide-react"
import { ActionLink, Card, Container, PageIntro } from "../components/ui"

export default function ContactPage() {
  const [draftHref, setDraftHref] = useState("")
  function prepareDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = `RealReach inquiry from ${String(form.get("name") || "website visitor")}`
    const body = [`Name: ${form.get("name") || ""}`, `Email: ${form.get("email") || ""}`, `Business: ${form.get("company") || "Not specified"}`, `Area: ${form.get("area") || "Not specified"}`, "", String(form.get("message") || "")].join("\n")
    setDraftHref(`mailto:hello@realreach.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }
  return <>
    <section className="page-hero"><Container className="page-hero-grid"><PageIntro eyebrow="Contact" title="Start a conversation about your campaign." description="Tell us about your business, the area you have in mind, and any print or distribution needs." /><p className="page-aside">This form is not connected to a server and does not send data automatically. After completing it, you can open and review an email draft on your device before sending it.</p></Container></section>
    <section className="section"><Container className="split-layout" style={{ alignItems: "start" }}>
      <div><h2>Get in touch</h2><Card className="card-pad" style={{ marginTop: 22 }}><p className="eyebrow">Email</p><a href="mailto:hello@realreach.it" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, color: "var(--brand)" }}><Mail aria-hidden="true" />hello@realreach.it</a><p className="body-copy" style={{ marginTop: 16, marginBottom: 0 }}>For campaign, print coordination, or Milan coverage inquiries.</p></Card><Card className="card-pad" style={{ marginTop: 15 }}><p className="eyebrow">Starting area</p><p style={{ display: "flex", alignItems: "center", gap: 9, margin: 0, fontWeight: 700 }}><MapPin aria-hidden="true" />Milan, Italy</p></Card></div>
      <Card className="card-pad"><h2 style={{ fontSize: "1.7rem" }}>Share your inquiry</h2><p className="body-copy">Your details are used to prepare an email draft on this device only; this website does not upload or store them.</p><form className="form-grid" onSubmit={prepareDraft}>
        <label className="form-field">Name<input name="name" autoComplete="name" required /></label>
        <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label className="form-field">Business or organisation <span className="form-help">Optional</span><input name="company" autoComplete="organization" /></label>
        <label className="form-field">Area you have in mind <span className="form-help">Optional</span><input name="area" autoComplete="address-level2" /></label>
        <label className="form-field">How can we help?<textarea name="message" required minLength={10} /></label>
        <p className="form-help">Nothing is sent until you review the email draft and choose Send in your email app.</p>
        <button className="button button--primary" type="submit">Prepare email draft</button>
        {draftHref && <div className="form-status" role="status">Your draft is ready on this device. Review it before sending.<br /><ActionLink to={draftHref} variant="quiet" showArrow={false}>Open email draft</ActionLink></div>}
      </form></Card>
    </Container></section>
  </>
}
