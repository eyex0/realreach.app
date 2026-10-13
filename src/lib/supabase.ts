import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export type RealReachSupabaseClient = SupabaseClient<Database>

const projectUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim()
const publishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  ""
).trim()

function isHttpUrl(value: string) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export const supabaseConfigured = Boolean(projectUrl && publishableKey && isHttpUrl(projectUrl))

let clientPromise: Promise<RealReachSupabaseClient | null> | null = null

export function loadSupabaseClient() {
  if (!supabaseConfigured) return Promise.resolve(null)
  if (clientPromise) return clientPromise

  clientPromise = import("@supabase/supabase-js")
    .then(({ createClient }) => createClient<Database>(projectUrl, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    }))
    .catch((error: unknown) => {
      clientPromise = null
      throw error
    })

  return clientPromise
}
