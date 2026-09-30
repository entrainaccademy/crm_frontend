"use client";
import { useState } from "react";
import {
  Trophy,
  Target,
  TrendingUp,
  Users,
  Download,
  Plus,
  Check,
  Shield,
  Save,
} from "lucide-react";
import {
  DataTable,
  UserAvatar,
  ProgressBar,
  StatusBadge,
  StatCard,
  FilterDropdown,
  SearchInput,
  DateRangeFilter,
} from "./ui";
import { rankExecutives, money, roles, access, sources, statuses, priorities, convertedStatuses, closedStatuses } from "@/lib/data";
import { SalesChart } from "./dashboard";
export function LeaderboardPage({ people }) {
  const [period, setPeriod] = useState("This Month");
  const multiplier =
    period === "Last Month" ? 0.92 : period === "This Quarter" ? 2.8 : 1;
  const ranked = rankExecutives(
    people.map((p) => ({
        ...p,
        sales: Math.round(p.sales * multiplier),
        target: period === "This Quarter" ? p.target * 3 : p.target,
      })),
  );
  return (
    <>
      <div className="stats-grid four">
        <StatCard
          label="Top performer"
          value={ranked[0]?.short || "—"}
          change="Leading the way"
          icon={Trophy}
        />
        <StatCard
          label="Highest sales"
          value={money(Math.max(0, ...ranked.map((p) => p.sales)))}
          icon={TrendingUp}
        />
        <StatCard
          label="Highest conversions"
          value={Math.max(0, ...ranked.map((p) => p.conversions))}
          icon={Users}
        />
        <StatCard
          label="Target achieved"
          value={`${ranked.filter((p) => p.sales >= p.target).length} executives`}
          icon={Target}
        />
      </div>
      <section className="card">
        <div className="table-toolbar">
          <div>
            <h2>Sales leaderboard</h2>
            <p className="section-subtitle">
              Ranked by target achievement, then total sales.
            </p>
          </div>
          <div className="filter-row">
            <FilterDropdown
              value={period}
              onChange={setPeriod}
              options={[
                "This Month",
                "Last Month",
                "This Quarter",
                "Custom Range",
              ]}
            />
            {period === "Custom Range" && (
              <>
                <input aria-label="Start date" type="date" />
                <input aria-label="End date" type="date" />
              </>
            )}
          </div>
        </div>
        <DataTable
          rows={ranked}
          columns={[
            {
              key: "rank",
              label: "Position",
              render: (r, i) => (
                <span className={`rank ${i < 3 ? "top-rank" : ""}`}>
                  #{i + 1}
                </span>
              ),
            },
            {
              key: "name",
              label: "Salesperson",
              render: (r, i) => (
                <div className="person-cell">
                  <UserAvatar name={r.name} index={i} />
                  <strong>{r.name}</strong>
                </div>
              ),
            },
            { key: "target", label: "Target", render: (r) => money(r.target) },
            {
              key: "sales",
              label: "Achieved",
              render: (r) => <strong>{money(r.sales)}</strong>,
            },
            {
              key: "pct",
              label: "Achievement",
              render: (r) => (
                <div className="table-progress">
                  <strong>{Math.round((r.sales / r.target) * 100)}%</strong>
                  <ProgressBar value={(r.sales / r.target) * 100} />
                </div>
              ),
            },
            {
              key: "remaining",
              label: "Remaining",
              render: (r) => money(Math.max(0, r.target - r.sales)),
            },
            { key: "conversions", label: "Conversions" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <StatusBadge
                  status={
                    r.sales >= r.target
                      ? "Target Achieved"
                      : r.sales
                        ? "In Progress"
                        : "Target Pending"
                  }
                />
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
export function TargetsPage({ people, setPeople, notify }) {
  const [who, setWho] = useState(people[0]?.name || ""),
    [amount, setAmount] = useState(500000),
    [period, setPeriod] = useState("Monthly"),
    [history, setHistory] = useState(() =>
      people.flatMap((person) =>
        [
          ["August 2026", 0.94],
          ["July 2026", 0.88],
          ["June 2026", 0.81],
        ].map(([month, factor]) => ({
          id: `${person.id}-${month}`,
          executive: person.name,
          period: month,
          target: person.target,
          sales: Math.round(person.sales * factor),
        })),
      ),
    );
  if (!people.length) {
    return <div className="card empty-inline">No salespeople yet. Create a Team Lead or Sales Executive account before assigning targets.</div>;
  }
  return (
    <div className="two-columns">
      <section className="card detail-card">
        <h2>Assign a sales target</h2>
        <p className="section-subtitle">
          Set a monthly or quarterly goal for one salesperson.
        </p>
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            setPeople(
              people.map((p) =>
                p.name === who ? { ...p, target: Number(amount) } : p,
              ),
            );
            setHistory([
              {
                id: Date.now(),
                executive: who,
                period: period + " · September 2026",
                target: Number(amount),
                sales: 0,
              },
              ...history,
            ]);
            notify("Target saved successfully");
          }}
        >
          <label>
            Salesperson
            <select value={who} onChange={(e) => setWho(e.target.value)}>
              {people.map((person) => (
                <option key={person.id} value={person.name}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Period
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </label>
          <label>
            Month
            <input type="month" defaultValue="2026-09" required />
          </label>
          <label>
            Target amount (₹)
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button className="primary">
            <Save size={15} /> Save target
          </button>
        </form>
      </section>
      <section className="card detail-card">
        <h2>Target history</h2>
        <DataTable
          rows={history.filter((entry) => entry.executive === who)}
          columns={[
            { key: "period", label: "Period" },
            { key: "target", label: "Target", render: (r) => money(r.target) },
            { key: "sales", label: "Achieved", render: (r) => money(r.sales) },
            {
              key: "pct",
              label: "Achievement",
              render: (r) => (
                <StatusBadge
                  status={Math.round((r.sales / r.target) * 100) + "%"}
                />
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
export function StaffPage({ people = [], leads = [], calls = [], followups = [], openModal }) {
  const [search, setSearch] = useState(""),
    [selectedRole, setSelectedRole] = useState(""),
    [status, setStatus] = useState("");
  const members = people.map((p) => ({ ...p, role: p.role || "Sales Executive" }));
  return (
    <section className="card">
      <div className="table-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search staff…"
        />
        <div className="filter-row">
          <FilterDropdown
            label="Role"
            value={selectedRole}
            onChange={setSelectedRole}
            options={["Super Admin", "Data Analytics Manager", "Team Lead", "Sales Executive"]}
          />
          <FilterDropdown
            label="Status"
            value={status}
            onChange={setStatus}
            options={["Active", "Inactive"]}
          />
        </div>
      </div>
      <DataTable
        rows={members.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (!selectedRole || p.role === selectedRole) &&
            (!status || p.status === status),
        )}
        onRow={(p) => openModal({ type: "employee", record: p })}
        columns={[
          {
            key: "name",
            label: "Staff member",
            render: (r, i) => (
              <div className="person-cell">
                <UserAvatar name={r.name} index={i} />
                <strong>{r.name}</strong>
              </div>
            ),
          },
          { key: "role", label: "Role" },
          {
            key: "leads",
            label: "Active leads",
            render: (r) =>
              ["Sales Executive", "Team Lead"].includes(r.role)
                ? leads.filter((l) => l.assigned === r.name && !closedStatuses.includes(l.status)).length
                : "—",
          },
          {
            key: "calls",
            label: "Calls",
            render: (r) =>
              ["Sales Executive", "Team Lead"].includes(r.role)
                ? calls.filter((c) => c.assigned === r.name).length
                : "—",
          },
          {
            key: "followups",
            label: "Follow-ups",
            render: (r) =>
              ["Sales Executive", "Team Lead"].includes(r.role)
                ? followups.filter((f) => f.assigned === r.name && f.completed).length
                : "—",
          },
          {
            key: "conversions",
            label: "Conversions",
            render: (r) =>
              ["Sales Executive", "Team Lead"].includes(r.role)
                ? leads.filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status)).length
                : "—",
          },
          {
            key: "sales",
            label: "Sales",
            render: (r) => {
              if (!["Sales Executive", "Team Lead"].includes(r.role)) return "—";
              const wonTotal = leads
                .filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status))
                .reduce((sum, l) => sum + (Number(l.saleAmount) || 0), 0);
              return money(wonTotal || r.sales || 0);
            },
          },
          {
            key: "target",
            label: "Achievement",
            render: (r) => {
              if (r.target == null) return "—";
              const wonTotal = leads
                .filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status))
                .reduce((sum, l) => sum + (Number(l.saleAmount) || 0), 0) || r.sales || 0;
              return `${Math.round((wonTotal / Math.max(1, r.target)) * 100)}%`;
            },
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusBadge status={r.status || "Active"} />,
          },
        ]}
      />
    </section>
  );
}
export function AnalyticsPage({
  page,
  people = [],
  leads = [],
  followups = [],
  calls = [],
  period = "This Month",
  onPeriodChange,
  exportData,
}) {
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const isSales = page === "performance" || page === "sales-reports";
  const executiveName = people.some(
    (person) => person.name === selectedExecutive,
  )
    ? selectedExecutive
    : people[0]?.name;
  const executive = people.find((person) => person.name === executiveName);
  const visiblePeople =
    page === "performance" ? (executive ? [executive] : []) : people;

  const wonLeads = leads.filter((l) => convertedStatuses.includes(l.status));
  const totalSales = wonLeads.reduce((s, l) => s + (Number(l.saleAmount) || 0), 0);
  const totalTarget = people.reduce((s, p) => s + (Number(p.target) || 0), 0) || 3600000;
  const achievementPct = `${Math.round((totalSales / Math.max(1, totalTarget)) * 100)}%`;
  const conversionRate = leads.length > 0 ? `${((wonLeads.length / leads.length) * 100).toFixed(1)}%` : "0%";

  const execWonLeads = executive ? leads.filter((l) => l.assigned === executive.name && convertedStatuses.includes(l.status)) : [];
  const execSales = execWonLeads.reduce((s, l) => s + (Number(l.saleAmount) || 0), 0) || executive?.sales || 0;
  const execTarget = executive?.target || 500000;

  const answeredCalls = calls.filter((c) => c.callStatus === "Answered").length;
  const missedCalls = calls.filter((c) => c.callStatus === "Missed").length;
  const completedFollowups = followups.filter((f) => f.completed).length;
  const scheduledFollowups = followups.filter((f) => !f.completed).length;

  return (
    <>
      {page === "performance" && executive && (
        <div className="performance-toolbar">
          <DateRangeFilter value={period} onChange={onPeriodChange} />
          <label>
            Salesperson
            <select
              value={executiveName}
              onChange={(event) => setSelectedExecutive(event.target.value)}
            >
              {people.map((person) => (
                <option key={person.id} value={person.name}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="stats-grid four">
        {(page === "performance"
          ? [
              ["Sales achieved", money(execSales)],
              ["Individual target", money(execTarget)],
              [
                "Target achievement",
                `${Math.round((execSales / Math.max(1, execTarget)) * 100)}%`,
              ],
              ["Conversions", execWonLeads.length || executive?.conversions || 0],
            ]
          : isSales
            ? [
                ["Total sales", money(totalSales)],
                ["Monthly target", money(totalTarget)],
                ["Target achievement", achievementPct],
                ["Conversion rate", conversionRate],
              ]
            : page === "lead-reports"
              ? [
                  ["Leads assigned", leads.length],
                  ["Conversions", wonLeads.length],
                  ["Lost leads", leads.filter((l) => l.status === "Lost").length],
                  ["Conversion rate", conversionRate],
                ]
              : page === "call-reports"
                ? [
                    ["Calls logged", calls.length],
                    ["Answered", answeredCalls],
                    ["Missed calls", missedCalls],
                    ["Avg. duration", calls.length > 0 ? "04:15" : "00:00"],
                  ]
                : [
                    ["Follow-ups completed", completedFollowups],
                    ["Scheduled", scheduledFollowups],
                    ["Overdue", followups.filter((f) => !f.completed && f.date < new Date().toISOString().split("T")[0]).length],
                    ["Completion rate", followups.length > 0 ? `${Math.round((completedFollowups / followups.length) * 100)}%` : "100%"],
                  ]
        ).map(([label, value]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={TrendingUp}
            showComparison={page !== "performance"}
          />
        ))}
      </div>
      <div className="two-columns">
        <section className="card">
          <div className="section-heading">
            <h2>
              {isSales ? "Sales performance over time" : "Activity over time"}
            </h2>
            <span className="muted">{period}</span>
          </div>
          <SalesChart
            period={period}
            leads={leads}
            salesTotal={page === "performance" ? execSales : totalSales}
            targetTotal={page === "performance" ? execTarget : totalTarget}
          />
        </section>
        <section className="card detail-card">
          <h2>
            {page === "performance"
              ? "Individual activity"
              : page === "lead-reports"
                ? "Lead source analysis"
                : "Conversion analysis"}
          </h2>
          {page === "performance"
            ? [
                ["Leads assigned", leads.filter((l) => l.assigned === executive?.name).length],
                ["Calls made", calls.filter((c) => c.assigned === executive?.name).length],
                ["Follow-ups completed", followups.filter((f) => f.assigned === executive?.name && f.completed).length],
                ["Conversions", execWonLeads.length],
              ].map(([name, value]) => (
                <div className="source-row" key={name}>
                  <div>
                    <span>{name}</span>
                    <strong>{value}</strong>
                  </div>
                </div>
              ))
              : sources.map((srcName) => {
                const count = leads.filter((l) => l.source === srcName).length;
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div className="source-row" key={srcName}>
                    <div>
                      <span>{srcName}</span>
                      <strong>{pct}% ({count})</strong>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                );
              })}
        </section>
      </div>
      <section className="card spaced">
        <div className="section-heading">
          <h2>Salesperson performance</h2>
          <div className="row-actions">
            <button onClick={() => exportData(visiblePeople, page)}>
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => exportData(visiblePeople, page, "xls")}>
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>
        <DataTable
          rows={visiblePeople}
          columns={[
            { key: "name", label: "Executive" },
            {
              key: "sales",
              label: "Sales",
              render: (r) => {
                const won = leads
                  .filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status))
                  .reduce((s, l) => s + (Number(l.saleAmount) || 0), 0) || r.sales || 0;
                return money(won);
              },
            },
            { key: "target", label: "Target", render: (r) => money(r.target || 500000) },
            {
              key: "achievement",
              label: "Achievement",
              render: (r) => {
                const won = leads
                  .filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status))
                  .reduce((s, l) => s + (Number(l.saleAmount) || 0), 0) || r.sales || 0;
                return ((won / Math.max(1, r.target || 500000)) * 100).toFixed(1) + "%";
              },
            },
            {
              key: "leads",
              label: "Leads assigned",
              render: (r) => leads.filter((l) => l.assigned === r.name).length,
            },
            {
              key: "calls",
              label: "Calls made",
              render: (r) => calls.filter((c) => c.assigned === r.name).length,
            },
            {
              key: "followups",
              label: "Follow-ups",
              render: (r) => followups.filter((f) => f.assigned === r.name && f.completed).length,
            },
            {
              key: "conversions",
              label: "Conversions",
              render: (r) => leads.filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status)).length,
            },
            {
              key: "rate",
              label: "Conversion rate",
              render: (r) => {
                const assignedCount = leads.filter((l) => l.assigned === r.name).length;
                const wonCount = leads.filter((l) => l.assigned === r.name && convertedStatuses.includes(l.status)).length;
                return assignedCount > 0 ? `${Math.round((wonCount / assignedCount) * 100)}%` : "0%";
              },
            },
            {
              key: "lost",
              label: "Lost leads",
              render: (r) => leads.filter((l) => l.assigned === r.name && l.status === "Lost").length,
            },
          ]}
        />
      </section>
      {page === "lead-reports" && (
        <section className="card detail-card spaced">
          <h2>Lost lead reasons</h2>
          {[
            ["Budget constraints", 0],
            ["Timing", 0],
            ["Competitor selected", 0],
            ["No response", leads.filter((l) => l.status === "Lost").length],
          ].map(([n, v]) => (
            <div className="source-row" key={n}>
              <div>
                {n}
                <strong>{v}</strong>
              </div>
              <ProgressBar value={v > 0 ? 100 : 0} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
export function UsersPage({ users, openModal, onStatusChange, canManage = false, loading = false, loadError = false }) {
  const [tab, setTab] = useState("Users");
  return (
    <section className="card">
      <div className="tabs">
        {["Users", "Role permissions"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Users" ? loading ? (
        <div className="users-table-loading" role="status" aria-label="Loading accounts">
          <div aria-hidden="true">
            <div className="workspace-skeleton-table-head skeleton-block" />
            {Array.from({ length: 6 }, (_, row) => (
              <div className="workspace-skeleton-table-row" key={row}>
                <span className="workspace-skeleton-cell skeleton-block" />
                <span className="workspace-skeleton-cell skeleton-block" />
                <span className="workspace-skeleton-cell skeleton-block" />
                <span className="workspace-skeleton-cell skeleton-block" />
              </div>
            ))}
          </div>
          <span className="workspace-skeleton-status">Loading accounts…</span>
        </div>
      ) : loadError ? (
        <div className="empty-inline" role="alert">Could not load accounts. Refresh the page and check the backend connection.</div>
      ) : (
        <DataTable
          rows={users}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (r) => (
                <div className="person-cell">
                  <UserAvatar name={r.name} />
                  <strong>{r.name}</strong>
                </div>
              ),
            },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "role", label: "Role" },
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusBadge status={r.status} />,
            },
            canManage && {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="row-actions">
                  <button
                    onClick={() => openModal({ type: "user", record: r })}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onStatusChange(r)}
                  >
                    {r.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ),
            },
          ].filter(Boolean)}
        />
      ) : (
        <div className="permissions-grid">
          {roles.map((role) => (
            <div key={role} className="permission-card">
              <Shield size={19} />
              <h3>{role}</h3>
              {access[role].map((p) => (
                <span key={p}>
                  <Check size={12} />
                  {p.replaceAll("-", " ")}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
export function SettingsPage({ notify }) {
  const sections = [
    "General",
    "Lead Settings",
    "Lead Sources",
    "Lead Statuses",
    "Roles & Permissions",
    "Target Settings",
    "Call Settings",
    "WhatsApp Settings",
    "Notifications",
  ];
  const [section, setSection] = useState("General");
  return (
    <section className="card settings-layout">
      <nav>
        {sections.map((s) => (
          <button
            key={s}
            className={section === s ? "active" : ""}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </nav>
      <div className="settings-content">
        <h2>{section}</h2>
        <p className="section-subtitle">Manage your workspace preferences.</p>
        {section === "Call Settings" || section === "WhatsApp Settings" ? (
          <div className="integration-placeholder">
            <Shield size={28} />
            <h3>{section.split(" ")[0]} integration</h3>
            <p>{section.split(" ")[0]} integration will be configured later.</p>
            <StatusBadge status="Not connected" />
          </div>
        ) : (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              notify(section + " saved for this demo session");
            }}
          >
            {section === "General" ? (
              <>
                <label>
                  Company name
                  <input defaultValue="ENTRAIN" required />
                </label>
                <label>
                  Workspace email
                  <input
                    type="email"
                    defaultValue="hello@entrain.in"
                    required
                  />
                </label>
                <label>
                  Timezone
                  <select>
                    <option>Asia/Kolkata (GMT +5:30)</option>
                  </select>
                </label>
                <label>
                  Currency
                  <select>
                    <option>INR — Indian Rupee (₹)</option>
                  </select>
                </label>
              </>
            ) : section === "Notifications" ? (
              [
                "Follow-up reminders",
                "New lead assignments",
                "Target milestones",
                "Staff updates",
              ].map((t) => (
                <label className="checkbox-label" key={t}>
                  <input type="checkbox" defaultChecked />
                  {t}
                </label>
              ))
            ) : section === "Roles & Permissions" ? (
              <div>
                {roles.map((r) => (
                  <p key={r}>
                    {r} · {access[r].length} permitted screens
                  </p>
                ))}
              </div>
            ) : (
              <>
                <label>
                  {section === "Target Settings"
                    ? "Default monthly target (₹)"
                    : "Available values"}
                  <textarea
                    defaultValue={
                      section === "Lead Sources"
                        ? sources.join(", ")
                        : section === "Lead Statuses"
                          ? statuses.join(", ")
                            : section === "Target Settings"
                              ? "500000"
                              : `Default priority: ${priorities[1]}`
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Enable for this workspace
                </label>
              </>
            )}
            <button className="primary">
              <Save size={15} /> Save changes
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
export function TasksPage({ tasks = [], setTasks }) {
  const [newTask, setNewTask] = useState("");
  const currentTasks = tasks || [];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const taskObj = {
      id: Date.now(),
      name: newTask,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      done: false,
    };
    if (setTasks) {
      setTasks([taskObj, ...currentTasks]);
    }
    setNewTask("");
  };

  return (
    <section className="card detail-card">
      <div className="section-heading">
        <div>
          <h2>Employee tasks</h2>
          <p className="section-subtitle">Manage assignments and key follow-up activities.</p>
        </div>
      </div>
      <form onSubmit={handleAddTask} className="task-add-form" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="primary" type="submit">
          <Plus size={15} /> Add Task
        </button>
      </form>
      {currentTasks.length === 0 ? (
        <div className="empty-inline" style={{ padding: "20px 0", color: "#64748b" }}>
          No open tasks. Use the input above to add a new task.
        </div>
      ) : (
        currentTasks.map((t) => (
          <label className="task-row" key={t.id || t._id}>
            <input
              type="checkbox"
              checked={t.done || t.status === "Completed"}
              onChange={() => {
                if (setTasks) {
                  setTasks(
                    currentTasks.map((x) =>
                      x.id === t.id || x._id === t._id
                        ? { ...x, done: !x.done, status: !x.done ? "Completed" : "Pending" }
                        : x,
                    ),
                  );
                }
              }}
            />
            <span style={{ textDecoration: t.done || t.status === "Completed" ? "line-through" : "none" }}>
              {t.name || t.title}
            </span>
            <small>{t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today")}</small>
            <StatusBadge status={t.done || t.status === "Completed" ? "Completed" : "Pending"} />
          </label>
        ))
      )}
    </section>
  );
}

