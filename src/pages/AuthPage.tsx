import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { ActionLink, Card, Container, PageIntro } from "../components/ui"
import { roleDetails } from "../dashboard/config"
import { useAuth } from "../auth/AuthProvider"
import type { PublicSignupRole } from "../lib/database.types"

type AuthMode = "login" | "register"

type Message = { kind: "success" | "error"; text: string } | null

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const { configured, status, profile, signIn, signUp } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState<Message>(null)
  const [busy, setBusy] = useState(false)
  const [signupRole, setSignupRole] = useState<PublicSignupRole>("customer")
  const isRegister = mode === "register"
  const rawNext = searchParams.get("next") ?? ""
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"

  if (status === "signedIn" && profile) {
    return <Navigate to={roleDetails[profile.role].basePath} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    if (!configured) return

    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    setBusy(true)
    try {
      if (isRegister) {
        const result = await signUp({
          fullName: String(form.get("name") ?? ""),
          email,
          password,
          role: signupRole,
          organizationName: String(form.get("organizationName") ?? ""),
        })
        if (!result.ok) {
          setMessage({ kind: "error", text: result.message })
        } else if (result.needsEmailConfirmation) {
          setMessage({ kind: "success", text: "Check your inbox to confirm your email address before signing in. Your dashboard stays locked until your account role is verified." })
        } else {
          navigate("/dashboard", { replace: true })
        }
      } else {
        const result = await signIn(email, password)
        if (!result.ok) setMessage({ kind: "error", text: result.message })
        else navigate(nextPath, { replace: true })
      }
    } catch {
      setMessage({ kind: "error", text: "We could not complete that request. Please try again." })
    } finally {
      setBusy(false)
    }
  }

  const pending = status === "loading" || status === "loadingProfile" || busy

  return <section className="auth-shell"><Container><Card className="auth-card">
    <PageIntro eyebrow={isRegister ? "Registration" : "Account access"} title={isRegister ? "Create your account." : "Sign in to RealReach."} description={isRegister ? "Create a Customer or Distributor account. Administrator access cannot be requested through public registration." : "Sign in with your RealReach account to open the workspace allowed by your verified role."} />
    {!configured && <div className="note auth-setup-note" role="status"><strong>Supabase setup is required.</strong> Authentication is not active in this preview. The project URL, browser-safe publishable key, and database migration have not been configured. Do not enter a real password here.</div>}
    {configured && status === "error" && <div className="note auth-setup-note" role="alert">We could not verify the saved account role. Dashboard access remains blocked until the database setup is corrected.</div>}
    {isRegister && configured && <p className="form-help" style={{ marginTop: 18 }}>Email confirmation may be required before your first sign-in.</p>}
    <form className="form-grid" style={{ marginTop: 24 }} onSubmit={handleSubmit}>
      {isRegister && <label className="form-field">Full name<input name="name" autoComplete="name" required maxLength={120} /></label>}
      <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      {isRegister && <>
        <label className="form-field">Account type<select name="role" value={signupRole} onChange={(event) => setSignupRole(event.target.value as PublicSignupRole)} required><option value="customer">Customer</option><option value="distributor">Independent distributor</option></select></label>
        {signupRole === "customer" && <label className="form-field">Business or organisation name <span className="form-help">(optional)</span><input name="organizationName" autoComplete="organization" maxLength={160} /></label>}
      </>}
      <label className="form-field">Password<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={72} /></label>
      <button className="button button--primary" type="submit" disabled={!configured || pending} aria-busy={pending}>{pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
      {message && <p className={`form-status auth-message auth-message--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p>}
    </form>
    <p className="body-copy" style={{ marginTop: 22, fontSize: ".9rem" }}>{isRegister ? "Already have an account? " : "New to RealReach? "}<Link to={isRegister ? "/login" : "/register"} style={{ color: "var(--brand)", fontWeight: 700 }}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
    <div style={{ marginTop: 6 }}><ActionLink to="/" variant="quiet">Return to the public site</ActionLink></div>
  </Card></Container></section>
}
