import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"

export type DashboardResource = "campaigns" | "orders" | "jobs" | "reports" | "customers" | "distributors" | "evidence"
export type DashboardRow = Record<string, unknown>
export type DataState<T> =
  | { status: "unconfigured"; data: T | null }
  | { status: "loading"; data: T | null }
  | { status: "error"; data: T | null; message: string }
  | { status: "empty"; data: T }
  | { status: "ready"; data: T }

async function fetchRows(client: NonNullable<ReturnType<typeof useAuth>["client"]>, resource: DashboardResource, id?: string) {
  let result
  switch (resource) {
    case "campaigns": {
      let query = client.from("campaigns").select("id,name,coverage_area,leaflet_quantity,status,created_at").order("created_at", { ascending: false }).limit(8)
      if (id) query = query.eq("id", id)
      result = await query
      break
    }
    case "orders": {
      let query = client.from("orders").select("id,campaign_id,status,created_at").order("created_at", { ascending: false }).limit(8)
      if (id) query = query.eq("id", id)
      result = await query
      break
    }
    case "jobs": {
      let query = client.from("distribution_jobs").select("id,order_id,campaign_id,status,instructions,scheduled_for,created_at").order("created_at", { ascending: false }).limit(8)
      if (id) query = query.eq("id", id)
      result = await query
      break
    }
    case "reports":
      result = await client.from("campaign_reports").select("id,campaign_id,summary,published_at,created_at").order("created_at", { ascending: false }).limit(8)
      break
    case "customers":
      result = await client.from("customers").select("id,organization_name,created_at").order("created_at", { ascending: false }).limit(8)
      break
    case "distributors":
      result = await client.from("distributors").select("id,service_areas,availability,created_at").order("created_at", { ascending: false }).limit(8)
      break
    case "evidence":
      result = await client.from("delivery_evidence").select("id,job_id,review_status,note,created_at").order("created_at", { ascending: false }).limit(8)
      break
  }
  return { rows: result.data as unknown as DashboardRow[] | null, error: result.error }
}

async function fetchCount(client: NonNullable<ReturnType<typeof useAuth>["client"]>, resource: DashboardResource) {
  switch (resource) {
    case "campaigns": return client.from("campaigns").select("id", { count: "exact", head: true })
    case "orders": return client.from("orders").select("id", { count: "exact", head: true })
    case "jobs": return client.from("distribution_jobs").select("id", { count: "exact", head: true })
    case "reports": return client.from("campaign_reports").select("id", { count: "exact", head: true })
    case "customers": return client.from("customers").select("id", { count: "exact", head: true })
    case "distributors": return client.from("distributors").select("id", { count: "exact", head: true })
    case "evidence": return client.from("delivery_evidence").select("id", { count: "exact", head: true })
  }
}

export function useDashboardRows(resource: DashboardResource, id?: string) {
  const { client } = useAuth()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<DataState<DashboardRow[]>>({ status: client ? "loading" : "unconfigured", data: null })

  useEffect(() => {
    if (!client) {
      setState({ status: "unconfigured", data: null })
      return
    }
    let active = true
    setState({ status: "loading", data: null })
    void fetchRows(client, resource, id).then(({ rows, error }) => {
      if (!active) return
      if (error) {
        setState({ status: "error", data: null, message: "Records could not be loaded. Check the Supabase connection and Row Level Security policies." })
      } else if (!rows?.length) {
        setState({ status: "empty", data: [] })
      } else {
        setState({ status: "ready", data: rows })
      }
    }).catch(() => {
      if (active) setState({ status: "error", data: null, message: "Records could not be loaded. Check the Supabase connection and Row Level Security policies." })
    })
    return () => { active = false }
  }, [client, resource, id, revision])

  return { ...state, retry: () => setRevision((value) => value + 1) }
}

export function useDashboardCount(resource: DashboardResource) {
  const { client } = useAuth()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<DataState<number>>({ status: client ? "loading" : "unconfigured", data: null })

  useEffect(() => {
    if (!client) {
      setState({ status: "unconfigured", data: null })
      return
    }
    let active = true
    setState({ status: "loading", data: null })
    void fetchCount(client, resource).then(({ count, error }) => {
      if (!active) return
      if (error || count === null) {
        setState({ status: "error", data: null, message: "The authorized record count could not be loaded. Check the database policies." })
      } else {
        setState({ status: count === 0 ? "empty" : "ready", data: count })
      }
    }).catch(() => {
      if (active) setState({ status: "error", data: null, message: "The authorized record count could not be loaded. Check the database policies." })
    })
    return () => { active = false }
  }, [client, resource, revision])

  return { ...state, retry: () => setRevision((value) => value + 1) }
}
