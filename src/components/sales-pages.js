"use client";
import { useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  ArrowLeft,
  Mail,
  MapPin,
  CalendarClock,
  ArrowUpRight,
  Play,
  Check,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DataTable,
  SearchInput,
  FilterDropdown,
  StatusBadge,
  UserAvatar,
  ActivityTimeline,
  StatCard,
  EmptyState,
} from "./ui";
import { statuses, sources, priorities, closedStatuses, calls, money } from "@/lib/data";
export function LeadsPage({ leads, navigate, openModal, exportData, readOnly = false, canEditLead = () => true, canDeleteLead = false, canAssignLead = false }) {
  const [search, setSearch] = useState(""),
    [filters, setFilters] = useState(false),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [assigned, setAssigned] = useState(""),
    [priority, setPriority] = useState(""),
    [service, setService] = useState(""),
    [date, setDate] = useState(""),
    [page, setPage] = useState(1);
  const rows = leads.filter(
    (l) =>
      (l.name + l.phone).toLowerCase().includes(search.toLowerCase()) &&
      (!status || (status === "No status" ? !l.status : l.status === status)) &&
      (!source || l.source === source) &&
      (!assigned || l.assigned === assigned) &&
      (!priority || (priority === "No priority" ? !l.priority : l.priority === priority)) &&
      (!service || l.service === service) &&
      (!date || l.created === date),
  );
  return (
    <section className="card leads-table-card">
      <div className="table-toolbar">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search name or phone number…"
        />
        <div className="toolbar-right">
          <button onClick={() => setFilters(!filters)}>
            <SlidersHorizontal size={15} /> Filters
          </button>
          <button onClick={() => exportData(rows, "leads")}>
            <Download size={15} /> Export
          </button>
        </div>
      </div>
      {filters && (
        <div className="filter-row">
          {[
            [status, setStatus, [...new Set(["No status", ...statuses, ...leads.map((lead) => lead.status).filter(Boolean)])], "Status"],
            [
              assigned,
              setAssigned,
              [...new Set(leads.map((l) => l.assigned))],
              "Salesperson",
            ],
            [source, setSource, [...new Set([...sources, ...leads.map((lead) => lead.source).filter(Boolean)])], "Source"],
            [priority, setPriority, [...new Set(["No priority", ...priorities, ...leads.map((lead) => lead.priority).filter(Boolean)])], "Priority"],
            [
              service,
              setService,
              [...new Set(leads.map((l) => l.service))],
              "Course",
            ],
          ].map(([v, s, o, l]) => (
            <FilterDropdown
              key={l}
              value={v}
              onChange={(x) => {
                s(x);
                setPage(1);
              }}
              options={o}
              label={l}
              allLabel={l === "Status" ? "All statuses" : undefined}
            />
          ))}
          <input
            type="date"
            aria-label="Created date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      )}
      <DataTable
        rows={rows.slice((page - 1) * 8, page * 8)}
        onRow={(l) => navigate("leads/" + l.id)}
        columns={[
          {
            key: "name",
            label: "Customer",
            render: (r) => (
              <div className="person-cell">
                <UserAvatar name={r.name} index={r.id} />
                <div>
                  <strong>{r.name}</strong>
                  <small>{r.location.split(",")[0]}</small>
                </div>
              </div>
            ),
          },
          { key: "phone", label: "Phone" },
          { key: "source", label: "Source" },
          { key: "service", label: "Course" },
          {
            key: "saleAmount",
            label: "Sale amount",
            render: (r) => money(r.saleAmount ?? 0),
          },
          {
            key: "advanceAmount",
            label: "Advance amount",
            render: (r) => money(r.advanceAmount ?? 0),
          },
          { key: "assigned", label: "Assigned to" },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusBadge status={r.status} />,
          },
          { key: "date", label: "Next follow-up", render: (r) => r.date || "Not scheduled" },
          { key: "created", label: "Created date" },
          (!readOnly || canAssignLead || canDeleteLead) && {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="row-actions">
                {canEditLead(r) && <button className="lead-action-icon" aria-label={`Edit ${r.name}`} title="Edit lead" onClick={(event) => {
                  event.stopPropagation();
                  openModal({ type: "lead", record: r });
                }}><Pencil size={16} aria-hidden="true" /></button>}
                {!canEditLead(r) && canAssignLead && <button onClick={(event) => {
                  event.stopPropagation();
                  openModal({ type: "assignment", record: r });
                }}>Assign</button>}
                {canDeleteLead && <button className="danger-button lead-action-icon" aria-label={`Delete ${r.name}`} title="Delete lead" onClick={(event) => {
                  event.stopPropagation();
                  openModal({ type: "delete-lead", record: r });
                }}><Trash2 size={16} aria-hidden="true" /></button>}
              </div>
            ),
          },
        ].filter(Boolean)}
      />
      <div className="pagination">
        <span>
          Showing {rows.length ? (page - 1) * 8 + 1 : 0}–
          {Math.min(page * 8, rows.length)} of {rows.length} leads
        </span>
        <div>
          <button
            disabled={page === 1}
            aria-label="Previous page"
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            {page} / {Math.max(1, Math.ceil(rows.length / 8))}
          </span>
          <button
            aria-label="Next page"
            disabled={page * 8 >= rows.length}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
export function LeadDetails({ lead, openModal, notify, updateLead, navigate, readOnly = false, canEditLead = false, canDeleteLead = false, canAssignLead = false }) {
  const [note, setNote] = useState("");
  if (!lead) return <EmptyState title="Lead not found" />;
  const info = (title, fields) => (
    <section className="card detail-card">
      <h2>{title}</h2>
      <dl>
        {fields.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
  return (
    <>
      <button
        className="text-button back-button"
        onClick={() => navigate("leads")}
      >
        <ArrowLeft size={15} /> Back to leads
      </button>
      <section className="card lead-hero">
        <UserAvatar name={lead.name} size="large" />
        <div>
          <h1>{lead.name}</h1>
          <p>
            {lead.phone} · Assigned to {lead.assigned}
          </p>
        </div>
        <StatusBadge status={lead.status} />
        {canAssignLead && (
          <button className="primary" onClick={() => openModal({ type: "assignment", record: lead })}>
            Assign lead
          </button>
        )}
        {canEditLead && <button onClick={() => openModal({ type: "lead", record: lead })}>Edit lead</button>}
        {canDeleteLead && <button className="danger-button" onClick={() => openModal({ type: "delete-lead", record: lead })}>Delete lead</button>}
        {!readOnly && <div className="toolbar-right">
          <button
            onClick={() =>
              notify(
                "Demo call ready. Telephony integration will be configured later.",
              )
            }
          >
            <Phone size={15} /> Call
          </button>
          <button
            onClick={() =>
              notify("WhatsApp integration will be configured later.")
            }
          >
            <MessageCircle size={15} /> WhatsApp
          </button>
          <button
            className="primary"
            onClick={() => openModal({ type: "followup", lead })}
          >
            <Plus size={15} /> Follow-up
          </button>
        </div>}
      </section>
      <div className="details-grid">
        <div>
          {info("Customer information", [
            ["Name", lead.name],
            ["Phone", lead.phone],
            ["WhatsApp", lead.whatsapp],
            ["Email", lead.email],
            ["Location", lead.location],
          ])}
          {info("Lead information", [
            ["Lead source", lead.source],
            ["Course", lead.service],
            ["Priority", lead.priority || "No priority"],
            ["Assigned to", lead.assigned],
            ["Created", lead.created],
          ])}
          {info("Payment information", [
            ["Sale amount", money(lead.saleAmount ?? 0)],
            ["Advance amount", money(lead.advanceAmount ?? 0)],
            [
              "Balance due",
              money(
                Math.max(0, (lead.saleAmount ?? 0) - (lead.advanceAmount ?? 0)),
              ),
            ],
          ])}
        </div>
        <div>
          {info("Follow-up information", [
            ["Next follow-up", lead.date ? lead.date + " · " + (lead.time || "") : "Not scheduled"],
            ["Reason", "Discuss course admission"],
            ["Assigned person", lead.assigned],
          ])}
          <section className="card detail-card">
            <h2>Notes</h2>
            {lead.notes.map((n, i) => (
              <div className="note" key={i}>
                {typeof n === "string" ? n : n.text}
                <small>Just now · You</small>
              </div>
            ))}
            {!readOnly && <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (note.trim()) {
                  const saved = await updateLead({
                    ...lead,
                    notes: [...lead.notes, { text: note, author: "User" }],
                    activities: [
                      ...lead.activities,
                      { text: "Note added: " + note, time: "Just now" },
                    ],
                  });
                  if (saved) setNote("");
                }
              }}
            >
              <textarea
                aria-label="Add note"
                placeholder="Add a note about this conversation…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
              <button className="primary" type="submit">
                Add note
              </button>
            </form>}
          </section>
        </div>
        <section className="card detail-card">
          <h2>Activity timeline</h2>
          <ActivityTimeline items={lead.activities} />
        </section>
      </div>
    </>
  );
}
export function FollowupsPage({
  followups = [],
  onComplete,
  onDelete,
  openModal,
  navigate,
  notify,
  readOnly = false,
  canWorkRecord = () => true,
}) {
  const [tab, setTab] = useState("All");
  const [pendingId, setPendingId] = useState(null);
  const todayStr = new Date().toISOString().split("T")[0];
  const rows = followups.filter((f) =>
    tab === "All"
      ? true
      : tab === "Completed"
      ? f.completed
      : !f.completed &&
        (tab === "Today"
          ? f.date === todayStr || !f.date
          : tab === "Upcoming"
            ? f.date > todayStr
            : f.date < todayStr),
  );
  return (
    <section className="card">
      <div className="tabs">
        {["All", "Today", "Upcoming", "Overdue", "Completed"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <DataTable
        rows={rows}
        columns={[
          {
            key: "name",
            label: "Customer",
            render: (r) => <strong>{r.name}</strong>,
          },
          { key: "phone", label: "Phone" },
          { key: "assigned", label: "Assigned to" },
          { key: "date", label: "Follow-up date" },
          { key: "time", label: "Time" },
          { key: "purpose", label: "Purpose" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <StatusBadge
                status={
                  r.completed
                    ? "Completed"
                    : r.date && r.date < todayStr
                      ? "Overdue"
                      : "Scheduled"
                }
              />
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="row-actions">
                <button onClick={() => navigate("leads/" + r.leadId)}>
                  View
                </button>
                {!readOnly && canWorkRecord(r) && <button
                  aria-label="Call customer"
                  onClick={() =>
                    notify(
                      "Demo call — telephony integration will be configured later.",
                    )
                  }
                >
                  <Phone size={14} />
                </button>}
                {!readOnly && canWorkRecord(r) && (
                  <>
                    <button
                      disabled={pendingId === r.id}
                      onClick={async () => {
                        setPendingId(r.id);
                        try { await onComplete(r); }
                        finally { setPendingId(null); }
                      }}
                    >
                      {r.completed ? "Reopen" : "Complete"}
                    </button>
                    {!r.completed && (
                      <button onClick={() => openModal({ type: "followup", record: r })}>
                        Reschedule
                      </button>
                    )}
                  </>
                )}
                {!readOnly && canWorkRecord(r) && (
                  <button className="danger-button" onClick={() => onDelete(r)}>Delete</button>
                )}
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
const pipelineStageColors = {
  New: "#8798a1",
  Contacted: "#7194a5",
  "Follow-up": "#aa8a55",
  Qualified: "#438a91",
  Converted: "#3f9c70",
  "Not Qualified": "#a88676",
  Lost: "#b28282",
};

export function LeadCard({ lead, navigate, onMove, onDragComplete, readOnly = false }) {
  return (
    <article
      className="kanban-card"
      draggable={!readOnly}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(lead.id));
        e.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("dragging");
        onDragComplete?.();
      }}
    >
      <div className="kanban-card-top">
        <span className={`priority priority-${(lead.priority || "none").toLowerCase()}`}>
          {lead.priority ? `${lead.priority} priority` : "No priority"}
        </span>
        <span className="kanban-source">{lead.source}</span>
      </div>
      <button
        className="lead-name"
        onClick={() => navigate("leads/" + lead.id)}
      >
        {lead.name}
      </button>
      <div className="kanban-phone">{lead.phone}</div>
      <div className="kanban-course">{lead.service}</div>
      <div className="kanban-card-money">
        <span>Sale amount</span>
        <strong>{money(lead.saleAmount ?? 0)}</strong>
      </div>
      <div className="kanban-owner">
        <UserAvatar name={lead.assigned} />
        <span>{lead.assigned}</span>
        <GripVertical size={15} aria-hidden="true" />
      </div>
      <div className="kanban-card-footer">
        <span>
          <CalendarClock size={14} />
          {lead.date ? new Date(lead.date + "T00:00:00").toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }) : "Not scheduled"}
        </span>
        <select
          aria-label={"Move " + lead.name + " to stage"}
          value={lead.status}
          disabled={readOnly}
          onChange={(e) => onMove(lead, e.target.value)}
        >
          <option value="">No status</option>
          {[...statuses, ...(lead.status && !statuses.includes(lead.status) ? [lead.status] : [])].map((stage) => (
            <option key={stage}>{stage}</option>
          ))}
        </select>
      </div>
    </article>
  );
}

export function PipelinePage({ leads, navigate, updateLead, readOnly = false, canEditLead = () => true }) {
  const [search, setSearch] = useState(""),
    [owner, setOwner] = useState(""),
    [course, setCourse] = useState(""),
    [dragOver, setDragOver] = useState("");
  const filtered = leads.filter(
    (lead) =>
      (lead.name + " " + lead.phone + " " + lead.service)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!owner || lead.assigned === owner) &&
      (!course || lead.service === course),
  );
  const pipelineStatuses = [...new Set([...(leads.some((lead) => !lead.status) ? [""] : []), ...statuses, ...leads.map((lead) => lead.status).filter(Boolean)])];
  const moveLead = (lead, status) => {
    if (readOnly || !canEditLead(lead)) return;
    if (lead.status === status) return;
    updateLead({
      ...lead,
      status,
      activities: [
        ...(lead.activities || []),
        { text: "Status changed to " + status, time: "Just now" },
      ],
    });
  };
  return (
    <section className="pipeline-workspace">
      <div className="pipeline-toolbar">
        <div className="pipeline-toolbar-summary">
          <strong>
            {filtered.length} lead{filtered.length === 1 ? "" : "s"}
          </strong>
          <span>
            across {pipelineStatuses.length} stages ·{" "}
            {money(
              filtered
                .filter((lead) => !closedStatuses.includes(lead.status))
                .reduce((sum, lead) => sum + (lead.saleAmount || 0), 0),
            )}{" "}
            active pipeline value
          </span>
        </div>
        <div className="pipeline-toolbar-filters">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search pipeline…"
          />
          <FilterDropdown
            label="All executives"
            value={owner}
            onChange={setOwner}
            options={[...new Set(leads.map((lead) => lead.assigned))]}
          />
          <FilterDropdown
            label="All courses"
            value={course}
            onChange={setCourse}
            options={[...new Set(leads.map((lead) => lead.service))]}
          />
        </div>
      </div>
      <div
        className="kanban"
        role="region"
        aria-label="Sales pipeline stages"
        tabIndex={0}
      >
        {pipelineStatuses.map((status) => {
          const stageLeads = filtered.filter((lead) => (lead.status || "") === status);
          return (
            <section
              className={`kanban-column ${dragOver === status ? "drag-over" : ""}`}
              key={status}
              style={{ "--stage-color": pipelineStageColors[status] || "#8a85a6" }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOver(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOver("");
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver("");
                const lead = leads.find(
                  (item) =>
                    item.id === Number(e.dataTransfer.getData("text/plain")),
                );
                if (lead && !readOnly && canEditLead(lead)) moveLead(lead, status);
              }}
            >
              <div className="kanban-column-header">
                <div>
                  <span className="stage-dot" />
                  <h3>{status || "No status"}</h3>
                  <span className="stage-count">{stageLeads.length}</span>
                </div>
                <p>
                  {money(
                    stageLeads.reduce(
                      (sum, lead) => sum + (lead.saleAmount || 0),
                      0,
                    ),
                  )}{" "}
                  total value
                </p>
              </div>
              <div className="kanban-column-body">
                {stageLeads.length ? (
                  stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      navigate={navigate}
                      onMove={moveLead}
                      readOnly={readOnly || !canEditLead(lead)}
                      onDragComplete={() => setDragOver("")}
                    />
                  ))
                ) : (
                  <div className="kanban-empty">No leads in this stage</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
export function CallsPage({ calls = [], allowedNames, notify, readOnly = false, canWorkRecord = () => true }) {
  const [search, setSearch] = useState("");
  const rows = (calls || []).filter(
    (c) =>
      (!allowedNames || allowedNames.includes(c.assigned)) &&
      ((c.name || "") + (c.phone || "") + (c.assigned || ""))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const answered = rows.filter((c) => c.callStatus === "Answered").length;
  const missed = rows.filter((c) => c.callStatus === "Missed").length;
  const outgoing = rows.filter((c) => c.direction === "Outgoing").length;

  return (
    <>
      <div className="stats-grid six">
        {[
          ["Total calls", rows.length],
          ["Answered calls", answered],
          ["Missed calls", missed],
          ["Outgoing calls", outgoing],
          ["Total duration", rows.length > 0 ? `${rows.length * 4}m` : "0m"],
          ["Average duration", rows.length > 0 ? "04:15" : "00:00"],
        ].map(([label, value]) => (
          <StatCard key={label} label={label} value={value} icon={Phone} />
        ))}
      </div>
      <section className="card">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search calls…"
          />
          <span className="muted">Call records</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "name", label: "Customer" },
            { key: "assigned", label: "Assigned to" },
            { key: "phone", label: "Phone" },
            { key: "direction", label: "Direction" },
            { key: "callDate", label: "Date" },
            { key: "callTime", label: "Time" },
            { key: "duration", label: "Duration" },
            {
              key: "callStatus",
              label: "Status",
              render: (r) => <StatusBadge status={r.callStatus} />,
            },
            {
              key: "recording",
              label: "Recording",
              render: (r) => (
                <button
                  disabled={r.callStatus === "Missed"}
                  onClick={() =>
                    notify(
                      "Call recording audio will be available after telephony integration.",
                    )
                  }
                >
                  <Play size={12} /> Play recording
                </button>
              ),
            },
            !readOnly && {
              key: "action",
              label: "Action",
              render: (r) => canWorkRecord(r) ? (
                <button
                  aria-label={"Call " + (r.name || "customer")}
                  onClick={() =>
                    notify("Call integration is ready.")
                  }
                >
                  <Phone size={14} />
                </button>
              ) : null,
            },
          ].filter(Boolean)}
        />
      </section>
    </>
  );
}
export function CustomersPage({ leads = [], navigate }) {
  const [search, setSearch] = useState("");
  const activeCustomers = (leads || []).filter((l) =>
    ((l.name || "") + (l.phone || "")).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="card">
      <div className="table-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search customers…"
        />
      </div>
      <DataTable
        rows={activeCustomers.slice(0, 20)}
        onRow={(r) => navigate("leads/" + r.id)}
        columns={[
          {
            key: "name",
            label: "Customer",
            render: (r) => (
              <div className="person-cell">
                <UserAvatar name={r.name} index={r.id} />
                <strong>{r.name}</strong>
              </div>
            ),
          },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "location", label: "Location", render: (r) => r.location || "—" },
          {
            key: "enquiries",
            label: "Enquiries",
            render: (r) => (r.activities?.length || 1),
          },
          { key: "date", label: "Last contact", render: (r) => r.date || r.created || "—" },
          { key: "assigned", label: "Assigned to", render: (r) => r.assigned || "Unassigned" },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusBadge status={r.status || "Active"} />,
          },
          {
            key: "actions",
            label: "",
            render: () => <ArrowUpRight size={16} />,
          },
        ]}
      />
    </section>
  );
}

