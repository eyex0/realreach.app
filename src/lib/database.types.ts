export type AppRole = "customer" | "distributor" | "admin"
export type PublicSignupRole = Exclude<AppRole, "admin">

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProfileRow = {
  id: string
  full_name: string
  phone: string | null
  created_at: string
  updated_at: string
}

export type UserRoleRow = {
  user_id: string
  role: AppRole
  created_at: string
}

export type CustomerRow = {
  id: string
  organization_name: string | null
  created_at: string
}

export type DistributorRow = {
  id: string
  service_areas: string[]
  availability: "unspecified" | "available" | "unavailable"
  created_at: string
  updated_at: string
}

export type CampaignRow = {
  id: string
  customer_id: string
  name: string
  coverage_area: string
  leaflet_quantity: number
  format: string | null
  preferred_start_date: string | null
  print_coordination: boolean
  brief: string | null
  status: "draft" | "submitted" | "approved" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export type OrderRow = {
  id: string
  campaign_id: string
  customer_id: string
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export type DistributionJobRow = {
  id: string
  order_id: string
  campaign_id: string
  distributor_id: string | null
  assigned_by: string | null
  instructions: string | null
  status: "assigned" | "accepted" | "in_progress" | "completed" | "cancelled"
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

export type DeliveryEvidenceRow = {
  id: string
  job_id: string
  submitted_by: string
  storage_path: string
  note: string | null
  review_status: "pending" | "approved" | "rejected"
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type CampaignReportRow = {
  id: string
  campaign_id: string
  summary: string
  metrics: Json
  published_at: string | null
  created_by: string | null
  created_at: string
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      user_roles: Table<UserRoleRow>
      customers: Table<CustomerRow>
      distributors: Table<DistributorRow>
      campaigns: Table<CampaignRow>
      orders: Table<OrderRow>
      distribution_jobs: Table<DistributionJobRow>
      delivery_evidence: Table<DeliveryEvidenceRow>
      campaign_reports: Table<CampaignReportRow>
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
