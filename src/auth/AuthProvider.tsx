import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, supabaseConfigured } from "../lib/supabase"
import type { AppRole, ProfileRow, PublicSignupRole } from "../lib/database.types"

export type AuthProfile = ProfileRow & { role: AppRole; email: string | null }
export type AuthStatus = "loading" | "unconfigured" | "signedOut" | "loadingProfile" | "signedIn" | "error"
export type AuthResult = { ok: true; needsEmailConfirmation?: boolean } | { ok: false; message: string }

type SignUpInput = {
  fullName: string
  email: string
  password: string
  role: PublicSignupRole
  organizationName?: string
}

type AuthContextValue = {
  client: typeof supabase
  configured: boolean
  status: AuthStatus
  user: User | null
  profile: AuthProfile | null
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (input: SignUpInput) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  updateProfile: (input: Pick<ProfileRow, "full_name" | "phone">) => Promise<AuthResult>
  refreshProfile: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [status, setStatus] = useState<AuthStatus>(supabaseConfigured ? "loading" : "unconfigured")
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(!supabaseConfigured)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [refreshVersion, setRefreshVersion] = useState(0)

  useEffect(() => {
    if (!supabase) {
      setStatus("unconfigured")
      setSessionReady(true)
      return
    }

    let active = true
    const applySession = (currentUser: User | null) => {
      if (!active) return
      setUser(currentUser)
      setSessionError(null)
      setSessionReady(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null)
    })

    void supabase.auth.getSession().then(({ data, error: restoreError }) => {
      if (!active) return
      if (restoreError) {
        setSessionError("Your saved session could not be restored. Please sign in again.")
        setSessionReady(true)
        setUser(null)
        return
      }
      applySession(data.session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setStatus("unconfigured")
      return
    }
    if (!sessionReady) {
      setStatus("loading")
      return
    }
    if (sessionError) {
      setStatus("error")
      setError(sessionError)
      return
    }
    if (!user) {
      setProfile(null)
      setError(null)
      setStatus("signedOut")
      return
    }

    let active = true
    setProfile(null)
    setError(null)
    setStatus("loadingProfile")

    void Promise.all([
      supabase.from("profiles").select("id,full_name,phone,created_at,updated_at").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("user_id,role,created_at").eq("user_id", user.id).maybeSingle(),
    ]).then(([profileResult, roleResult]) => {
      if (!active) return
      if (profileResult.error || roleResult.error || !profileResult.data || !roleResult.data) {
        setError("We could not verify your profile and role. Confirm that the RealReach database migration is applied, then try again.")
        setStatus("error")
        return
      }

      const role = roleResult.data.role
      if (role !== "customer" && role !== "distributor" && role !== "admin") {
        setError("Your account does not have a recognized RealReach role. Dashboard access is blocked.")
        setStatus("error")
        return
      }

      setProfile({ ...profileResult.data, role, email: user.email ?? null })
      setStatus("signedIn")
    }).catch(() => {
      if (!active) return
      setError("We could not verify your account. Dashboard access is blocked until the connection is available.")
      setStatus("error")
    })

    return () => {
      active = false
    }
  }, [sessionReady, sessionError, user?.id, refreshVersion])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Supabase is not configured for this project yet." }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    return authError ? { ok: false, message: authError.message } : { ok: true }
  }, [])

  const signUp = useCallback(async ({ fullName, email, password, role, organizationName }: SignUpInput): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Supabase is not configured for this project yet." }
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          organization_name: organizationName?.trim() || null,
          role,
        },
        emailRedirectTo: window.location.origin,
      },
    })
    if (authError) return { ok: false, message: authError.message }
    return { ok: true, needsEmailConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Supabase is not configured for this project yet." }
    const { error: authError } = await supabase.auth.signOut()
    return authError ? { ok: false, message: authError.message } : { ok: true }
  }, [])

  const updateProfile = useCallback(async (input: Pick<ProfileRow, "full_name" | "phone">): Promise<AuthResult> => {
    if (!supabase || !user) return { ok: false, message: "A verified signed-in account is required to update this profile." }
    const { error: updateError } = await supabase.from("profiles").update({
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || null,
    }).eq("id", user.id)
    if (updateError) return { ok: false, message: "The profile could not be updated. Check the database connection and row-level policies." }
    setProfile((current) => current ? { ...current, ...input, full_name: input.full_name.trim(), phone: input.phone?.trim() || null } : current)
    return { ok: true }
  }, [user?.id])

  const refreshProfile = useCallback(() => {
    setSessionError(null)
    setRefreshVersion((version) => version + 1)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    client: supabase,
    configured: supabaseConfigured,
    status,
    user,
    profile,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }), [status, user, profile, error, signIn, signUp, signOut, updateProfile, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
