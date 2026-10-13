import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { useParams } from "react-router-dom"
import { ActionLink, Card, IconTile } from "../components/ui"
import { AlertCircle, Check, Clock3, ClipboardList, LoaderCircle, Printer, Route, Users, type LucideIcon } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import { roleDetails, type DashboardRole } from "./config"
import { useDashboardCount, useDashboardRows, type DashboardResource, type DashboardRow } from "./useDashboardData"

function PageDescription({ children }: { children: ReactNode }) {
  return <p className="workspace-description">{children}</p>
}

function EmptyState({ title, description, icon: Icon = ClipboardList, action }: { title: string; description: string; icon?: LucideIcon; action?: { to: string; label: string } }) {
  return <Card className="empty-state"><IconTile><Icon /></IconTile><div><h2>{title}</h2><p>{description}</p>{action && <ActionLink to={action.to} variant="secondary">{action.label}</ActionLink>}</div></Card>
}

function LocalPreviewNote({ children }: { children: ReactNode }) {
  return <div className="note local-preview-note"><strong>Not connected in this phase.</strong> {children}</div>
}

function ModuleLinks({ items }: { items: { title: string; to: string; description: string }[] }) {
  return <div className="workspace-link-grid">{items.map((item) => <Card className="workspace-link-card" key={item.to}><p className="eyebrow">Workspace section</p><h2>{item.title}</h2><p>{item.description}</p><ActionLink to={item.to} variant="quiet">Open section</ActionLink></Card>)}</div>
}

function CountCard({ resource, label }: { resource: DashboardResource; label: string }) {
  const state = useDashboardCount(resource)
  return <Card className="workspace-metric-card" role={state.status === "error" ? "alert" : state.status === "loading" ? "status" : undefined}>
    <p className="eyebrow">{label}</p>
    {state.status === "loading" ? <p className="metric-value"><LoaderCircle size={20} className="auth-spinner" aria-label="Loading" /></p> : state.status === "error" ? <><p className="metric-error"><AlertCircle size={17} aria-hidden="true" /> Count unavailable</p><button className="text-button" type="button" onClick={state.retry}>Retry</button></> : state.status === "unconfigured" ? <p className="metric-error">Connection not configured</p> : <><p className="metric-value">{state.data}</p><p className="metric-caption">{state.data === 0 ? "No authorized records yet" : "Authorized records"}</p></>}
  </Card>
}

function dateLabel(value: unknown) {
  if (typeof value !== "string" || !value) return ""
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(parsed)
}

function recordTitle(row: DashboardRow, resource: DashboardResource) {
  const named = row.name ?? row.organization_name ?? row.summary
  if (typeof named === "string" && named.trim()) return named
  const id = typeof row.id === "string" ? row.id.slice(0, 8) : ""
  const label: Record<DashboardResource, string> = { campaigns: "Campaign", orders: "Order", jobs: "Job", reports: "Report", customers: "Customer account", distributors: "Distributor account", evidence: "Delivery evidence" }
  return id ? `${label[resource]} · ${id}` : label[resource]
}

function recordDetails(row: DashboardRow) {
  const details: string[] = []
  for (const key of ["status", "review_status", "availability", "coverage_area"]) {
    if (typeof row[key] === "string" && row[key]) details.push(String(row[key]).replaceAll("_", " "))
  }
  const date = dateLabel(row.scheduled_for ?? row.published_at ?? row.created_at)
  if (date) details.push(date)
  if (Array.isArray(row.service_areas) && row.service_areas.length) details.push(`${row.service_areas.length} service area${row.service_areas.length === 1 ? "" : "s"}`)
  return details.join(" · ")
}

function RecordsPanel({ resource, title, emptyTitle, emptyDescription, icon, recordId, detailBase, emptyAction }: {
  resource: DashboardResource
  title: string
  emptyTitle: string
  emptyDescription: string
  icon?: LucideIcon
  recordId?: string
  detailBase?: string
  emptyAction?: { to: string; label: string }
}) {
  const state = useDashboardRows(resource, recordId)
  if (state.status === "loading") return <Card className="data-state" role="status"><LoaderCircle size={19} className="auth-spinner" aria-hidden="true" /><span>Loading {title.toLowerCase()} available to this account…</span></Card>
  if (state.status === "unconfigured") return <EmptyState title="Supabase is not configured" description="No dashboard records were requested. Finish the connection and migration setup before accessing this workspace." icon={AlertCircle} />
  if (state.status === "error") return <Card className="data-state data-state--error" role="alert"><AlertCircle size={19} aria-hidden="true" /><div><h2>Unable to load {title.toLowerCase()}</h2><p>{state.message}</p><button className="text-button" type="button" onClick={state.retry}>Retry</button></div></Card>
  if (state.status === "empty") return <EmptyState title={emptyTitle} description={emptyDescription} icon={icon} action={emptyAction} />
  return <div className="record-list" role="list" aria-label={title}>{state.data.map((row) => {
    const id = typeof row.id === "string" ? row.id : ""
    const details = recordDetails(row)
    const href = detailBase && id ? `${detailBase}/${encodeURIComponent(id)}` : ""
    return <Card className="record-card" key={id || recordTitle(row, resource)} role="listitem"><div><p className="eyebrow">{resource === "evidence" ? "Evidence record" : resource === "jobs" ? "Assigned work" : title}</p><h2>{recordTitle(row, resource)}</h2>{details && <p className="record-meta">{details}</p>}{resource === "jobs" && typeof row.instructions === "string" && row.instructions && <p className="record-meta">{row.instructions}</p>}{resource === "evidence" && <p className="record-meta">File review or download is not enabled in this phase.</p>}</div>{href && <ActionLink to={href} variant="quiet">View details</ActionLink>}</Card>
  })}</div>
}

export function CustomerOverview() {
  return <>
    <PageDescription>Counts and lists below are loaded from records permitted by the signed-in customer’s Supabase policies.</PageDescription>
    <div className="workspace-metrics"><CountCard resource="campaigns" label="Campaigns" /><CountCard resource="orders" label="Orders" /></div>
    <ModuleLinks items={[{ title: "Create campaign", to: "/dashboard/customer/campaigns/new", description: "Review the campaign request form. Submission is not connected yet." }, { title: "Campaign history", to: "/dashboard/customer/campaigns", description: "Review campaign records visible to your account." }, { title: "Distribution reports", to: "/dashboard/customer/reports", description: "Review reports attached to campaigns you own." }, { title: "Account settings", to: "/dashboard/customer/settings", description: "Update the profile name and phone number linked to your signed-in account." }]} />
  </>
}

type CampaignPreview = { campaignName: string; businessName: string; area: string; quantity: string; format: string; preferredDate: string; print: string; brief: string }

export function CreateCampaignPage() {
  const [preview, setPreview] = useState<CampaignPreview | null>(null)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPreview({ campaignName: String(form.get("campaignName") || ""), businessName: String(form.get("businessName") || ""), area: String(form.get("area") || ""), quantity: String(form.get("quantity") || ""), format: String(form.get("format") || ""), preferredDate: String(form.get("preferredDate") || ""), print: String(form.get("print") || ""), brief: String(form.get("brief") || "") })
  }
  return <>
    <PageDescription>Enter campaign details to preview how the request form works. Submitting validates and previews your entries in this page only.</PageDescription>
    <LocalPreviewNote>Campaign submission is not connected. No campaign record is created or saved, and no payment or GPS data is collected.</LocalPreviewNote>
    <Card className="workspace-form-card"><form className="workspace-form" onSubmit={handleSubmit}>
      <label className="form-field">Campaign name<input name="campaignName" required maxLength={100} /></label>
      <label className="form-field">Business or organisation<input name="businessName" required maxLength={120} /></label>
      <label className="form-field">Preferred area in Milan<input name="area" required maxLength={120} placeholder="e.g. neighbourhood or postal area" /></label>
      <label className="form-field">Estimated leaflet quantity<input name="quantity" type="number" min="1" step="1" required /></label>
      <label className="form-field">Leaflet format<select name="format" defaultValue="" required><option value="" disabled>Select a format</option><option value="A6">A6</option><option value="A5">A5</option><option value="Other">Other / to be discussed</option></select></label>
      <label className="form-field">Preferred start date<input name="preferredDate" type="date" required /></label>
      <label className="form-field">Print coordination<select name="print" defaultValue="" required><option value="" disabled>Select an option</option><option value="Materials ready">Materials are ready</option><option value="Discuss printing">I would like to discuss printing</option></select></label>
      <label className="form-field workspace-form-wide">Campaign notes<textarea name="brief" maxLength={1000} placeholder="Share audience or practical details (optional)" /></label>
      <div className="workspace-form-wide"><button className="button button--primary" type="submit">Preview campaign details</button></div>
    </form></Card>
    {preview && <Card className="workspace-preview-result" role="status"><p className="eyebrow">Local form preview</p><h2>{preview.campaignName}</h2><p><strong>Business:</strong> {preview.businessName}</p><p><strong>Area:</strong> {preview.area}</p><p><strong>Estimated quantity:</strong> {preview.quantity}</p><p><strong>Format:</strong> {preview.format}</p><p><strong>Preferred date:</strong> {preview.preferredDate}</p><p><strong>Print:</strong> {preview.print}</p>{preview.brief && <p><strong>Notes:</strong> {preview.brief}</p>}<p className="form-help">This preview exists only in the current page state. Nothing was sent or persisted.</p></Card>}
  </>
}

export function CustomerCampaignHistory() {
  return <><PageDescription>Only campaigns returned by the current signed-in customer’s database policies are listed.</PageDescription><RecordsPanel resource="campaigns" title="Campaign history" emptyTitle="No campaign history yet" emptyDescription="No campaign records are currently authorized for this account. No sample campaigns are shown." icon={Route} emptyAction={{ to: "/dashboard/customer/campaigns/new", label: "Open campaign form" }} /></>
}

export function CustomerOrders() {
  return <><PageDescription>Orders are listed only when database policies authorize them for this customer.</PageDescription><RecordsPanel resource="orders" title="Orders" emptyTitle="No orders to display" emptyDescription="There are no authorized order records for this account." icon={ClipboardList} detailBase="/dashboard/customer/orders" /></>
}

export function CustomerOrderDetails() {
  const { orderId } = useParams()
  if (!orderId) return <><PageDescription>Choose an order from the Orders list to inspect its details.</PageDescription><EmptyState title="Select an order" description="This route has no order identifier. Open an order from the account’s authorized order list." icon={ClipboardList} action={{ to: "/dashboard/customer/orders", label: "Back to orders" }} /></>
  return <><PageDescription>Only the order identified in the URL and authorized by the current customer’s database policies can be shown.</PageDescription><RecordsPanel resource="orders" recordId={orderId} title="Order details" emptyTitle="Order not found or not authorized" emptyDescription="No matching order is available to this account. The application does not reveal whether an unauthorized order exists." icon={ClipboardList} emptyAction={{ to: "/dashboard/customer/orders", label: "Back to orders" }} /></>
}

export function CustomerReports() {
  return <><PageDescription>Reports are returned only for campaigns owned by the signed-in customer.</PageDescription><RecordsPanel resource="reports" title="Distribution reports" emptyTitle="No distribution reports yet" emptyDescription="No campaign reports are currently authorized for this account. No performance figures have been invented." icon={Printer} /></>
}

function SettingsPreview({ role }: { role: DashboardRole }) {
  const { profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? "")
    setPhone(profile?.phone ?? "")
  }, [profile?.id, profile?.full_name, profile?.phone])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    setBusy(true)
    const result = await updateProfile({ full_name: fullName.trim(), phone: phone.trim() || null })
    setBusy(false)
    setNotice(result.ok ? { kind: "success", text: "Profile details saved to your own account." } : { kind: "error", text: result.message })
  }

  return <>
    <PageDescription>Update the profile name and phone number linked to your signed-in {roleDetails[role].label.toLowerCase()} account. Email changes and notification preferences are not implemented here.</PageDescription>
    <Card className="workspace-form-card"><form className="workspace-form" onSubmit={handleSubmit}>
      <label className="form-field">Display name<input name="displayName" autoComplete="name" maxLength={120} required value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
      <label className="form-field">Email address<input name="email" type="email" autoComplete="email" value={profile?.email ?? ""} disabled /></label>
      <label className="form-field">Phone number <span className="form-help">(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
      <div className="form-help workspace-form-wide">Only the profile name and phone number are saved. Language and notification preferences are not stored.</div>
      <div className="workspace-form-wide"><button className="button button--primary" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Saving…" : "Save profile"}</button></div>
      {notice && <p className={`form-status auth-message--${notice.kind} workspace-form-wide`} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p>}
    </form></Card>
  </>
}

export function CustomerSettings() { return <SettingsPreview role="customer" /> }

export function DistributorOverview() {
  return <>
    <PageDescription>Job counts include only records assigned to the signed-in distributor and permitted by database policies.</PageDescription>
    <div className="workspace-metrics"><CountCard resource="jobs" label="Assigned jobs" /></div>
    <ModuleLinks items={[{ title: "Assigned jobs", to: "/dashboard/distributor/jobs", description: "Review job records assigned to this account." }, { title: "Delivery progress", to: "/dashboard/distributor/progress", description: "Preview status controls; status updates are not connected yet." }, { title: "Proof of delivery", to: "/dashboard/distributor/proof", description: "Select a local file preview; uploads are not implemented." }, { title: "Account settings", to: "/dashboard/distributor/settings", description: "Update the profile name and phone number linked to this account." }]} />
  </>
}

export function DistributorJobs() {
  return <><PageDescription>Only jobs assigned to the signed-in distributor are returned by the database policies.</PageDescription><RecordsPanel resource="jobs" title="Assigned jobs" emptyTitle="No jobs are assigned" emptyDescription="There are no authorized job records for this account. No sample delivery jobs have been added." icon={Route} detailBase="/dashboard/distributor/jobs" /></>
}

export function DistributorJobDetails() {
  const { jobId } = useParams()
  if (!jobId) return <><PageDescription>Choose a job from the Assigned jobs list to inspect instructions.</PageDescription><EmptyState title="Select an assigned job" description="This route has no job identifier. Open a job from the distributor’s authorized job list." icon={ClipboardList} action={{ to: "/dashboard/distributor/jobs", label: "Back to assigned jobs" }} /></>
  return <><PageDescription>Job details are loaded only when the current distributor is assigned to that job.</PageDescription><RecordsPanel resource="jobs" recordId={jobId} title="Job details" emptyTitle="Job not found or not assigned" emptyDescription="No matching job is available to this account. The application does not reveal whether an unauthorized job exists." icon={ClipboardList} emptyAction={{ to: "/dashboard/distributor/jobs", label: "Back to assigned jobs" }} /></>
}

const deliveryStatuses = ["Not started", "Accepted", "In progress", "Completed"]

export function DeliveryProgress() {
  const [status, setStatus] = useState("")
  return <>
    <PageDescription>Preview the delivery-status control intended for a future assigned job. No job is linked to this control yet.</PageDescription>
    <LocalPreviewNote>Choosing a status changes only this page’s local preview state. No job status is submitted, GPS location is collected, or data is saved.</LocalPreviewNote>
    <Card className="workspace-form-card"><label className="form-field">Preview a status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Choose a status to preview</option>{deliveryStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>{status && <div className="workspace-status-preview" role="status"><span className="status-dot" /><strong>{status}</strong><span>Local preview state only · no job record connected</span></div>}</Card>
    <div className="workspace-grid-cards workspace-grid-cards--single"><EmptyState title="No active delivery timeline" description="A real progress timeline requires an assigned job and an implemented status-update workflow." icon={Clock3} /></div>
  </>
}

export function ProofOfDelivery() {
  const [file, setFile] = useState<File | null>(null)
  function selectFile(event: ChangeEvent<HTMLInputElement>) { setFile(event.target.files?.[0] ?? null) }
  function clearFile() { setFile(null); const input = document.getElementById("proof-file") as HTMLInputElement | null; if (input) input.value = "" }
  return <>
    <PageDescription>This screen previews how a distributor might select delivery evidence for a future assigned job.</PageDescription>
    <LocalPreviewNote>File selection stays in this browser tab. Evidence is not uploaded, reviewed, or stored, and no delivery job is connected.</LocalPreviewNote>
    <Card className="workspace-form-card proof-card"><div className="proof-icon"><Check size={22} aria-hidden="true" /></div><h2>Select a proof file</h2><p className="body-copy">Choose an image or PDF to preview the file-selection state. Avoid confidential material.</p><label className="form-field">Image or PDF<input id="proof-file" type="file" accept="image/*,application/pdf" onChange={selectFile} /></label>{file && <div className="file-preview" role="status"><div><strong>{file.name}</strong><span>{(file.size / 1024).toFixed(0)} KB · selected locally, not uploaded</span></div><button className="button button--quiet" type="button" onClick={clearFile}>Remove file</button></div>}</Card>
  </>
}

export function DistributorSettings() { return <SettingsPreview role="distributor" /> }

const adminModules = [
  { title: "Campaign management", to: "/dashboard/admin/campaigns", description: "View campaigns returned under verified administrator policies." },
  { title: "Customer management", to: "/dashboard/admin/customers", description: "View customer records without fabricated account data." },
  { title: "Distributor management", to: "/dashboard/admin/distributors", description: "View distributor records and availability." },
  { title: "Delivery evidence", to: "/dashboard/admin/evidence", description: "Review authorized evidence metadata; file upload and review actions are not implemented." },
  { title: "Orders", to: "/dashboard/admin/orders", description: "View orders permitted by administrator database policies." },
  { title: "Reports", to: "/dashboard/admin/reports", description: "View campaign reports when real records exist." },
]

export function AdminOverview() {
  return <>
    <PageDescription>Counts are queried from the signed-in administrator’s authorized database view; no sample activity is inserted.</PageDescription>
    <div className="workspace-metrics workspace-metrics--admin"><CountCard resource="campaigns" label="Campaigns" /><CountCard resource="customers" label="Customers" /><CountCard resource="distributors" label="Distributors" /><CountCard resource="orders" label="Orders" /><CountCard resource="jobs" label="Distribution jobs" /><CountCard resource="evidence" label="Delivery evidence" /><CountCard resource="reports" label="Campaign reports" /></div>
    <ModuleLinks items={adminModules} />
  </>
}

function AdminEmptyModule({ title, description, icon = ClipboardList, resource }: { title: string; description: string; icon?: LucideIcon; resource: DashboardResource }) {
  return <><PageDescription>{description}</PageDescription>{resource === "evidence" && <LocalPreviewNote>Evidence records may display metadata, but private-file upload/download and review actions are not implemented in this phase.</LocalPreviewNote>}<RecordsPanel resource={resource} title={title} emptyTitle={`No ${title.toLowerCase()} records`} emptyDescription="No authorized records are currently available. No sample business data has been added." icon={icon} /></>
}

export function AdminCampaigns() { return <AdminEmptyModule title="Campaigns" resource="campaigns" description="Campaigns visible to the administrator role are listed below. No approval or assignment actions are connected." icon={Route} /> }
export function AdminCustomers() { return <AdminEmptyModule title="Customers" resource="customers" description="Customer records visible to the administrator role are listed below. No accounts are fabricated." icon={Users} /> }
export function AdminDistributors() { return <AdminEmptyModule title="Distributors" resource="distributors" description="Distributor records visible to the administrator role are listed below." icon={Users} /> }
export function AdminEvidence() { return <AdminEmptyModule title="Delivery evidence" resource="evidence" description="Only evidence records visible to the verified administrator role are listed. The evidence-storage workflow is not connected." icon={Check} /> }
export function AdminOrders() { return <AdminEmptyModule title="Orders" resource="orders" description="Order records visible to the administrator role are listed below. Payment processing is not implemented." icon={ClipboardList} /> }
export function AdminReports() { return <AdminEmptyModule title="Reports" resource="reports" description="Campaign reports visible to the administrator role are listed below. No performance figures or business activity have been invented." icon={Printer} /> }
