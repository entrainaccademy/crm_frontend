"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarClock,
  Columns3,
  Trophy,
  Target,
  ContactRound,
  Phone,
  ChartNoAxesCombined,
  FileChartColumn,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronsLeft,
  Menu,
  Plus,
  ArrowUpRight,
  LifeBuoy,
  LogOut,
  Check,
  CircleAlert,
  Command,
  BriefcaseBusiness,
  ChevronRight,
  PanelLeftClose,
  Download,
} from "lucide-react";
import Dashboard from "./dashboard";
import CourseCombobox from "./course-combobox";
import {
  PageHeader,
  DateRangeFilter,
  Modal,
  UserAvatar,
  StatusBadge,
  ConfirmDialog,
  EmptyState,
} from "./ui";
import {
  LeadsPage,
  LeadDetails,
  FollowupsPage,
  PipelinePage,
  CallsPage,
  CustomersPage,
} from "./sales-pages";
import {
  LeaderboardPage,
  TargetsPage,
  StaffPage,
  AnalyticsPage,
  UsersPage,
  SettingsPage,
  TasksPage,
} from "./management-pages";
import {
  roles,
  access,
  initialLeads,
  initialFollowups,
  notifications,
  statuses,
  sources,
  priorities,
  money,
  courses,
  courseFees,
  normalizeLead,
} from "@/lib/data";
import { api } from "@/lib/api";
const navGroups = [
  ["", [["dashboard", "Dashboard", LayoutDashboard]]],
  [
    "LEADS",
    [
      ["leads", "All Leads", Users],
      ["my-leads", "My Leads", UserRound],
      ["follow-ups", "Follow-ups", CalendarClock],
      ["pipeline", "Pipeline", Columns3],
    ],
  ],
  [
    "SALES",
    [
      ["leaderboard", "Leaderboard", Trophy],
      ["targets", "Targets", Target],
      ["customers", "Customers", ContactRound],
      ["calls", "Calls", Phone],
    ],
  ],
  [
    "PEOPLE",
    [
      ["staff", "Staff", Users],
      ["performance", "Performance", ChartNoAxesCombined],
      ["tasks", "Tasks", BriefcaseBusiness],
    ],
  ],
  [
    "REPORTS",
    [
      ["sales-reports", "Sales Reports", FileChartColumn],
      ["lead-reports", "Lead Reports", FileChartColumn],
      ["call-reports", "Call Reports", FileChartColumn],
      ["follow-up-reports", "Follow-up Reports", FileChartColumn],
    ],
  ],
  [
    "ADMINISTRATION",
    [
      ["users", "Users & Roles", ShieldCheck],
      ["settings", "Settings", Settings],
    ],
  ],
];
const titles = Object.fromEntries(
  navGroups.flatMap((g) => g[1].map((x) => [x[0], x[1]])),
);
const descriptions = {
  leads: "Every opportunity, in one place. Build relationships that grow.",
  "my-leads": "Your opportunities. Your next great conversation.",
  "follow-ups":
    "Stay on top of every conversation and never miss an opportunity.",
  pipeline:
    "A clear view of your opportunities, from first hello to closed deal.",
  leaderboard: "Celebrate progress. Recognize the people moving us forward.",
  targets: "Clear goals. Measurable progress. Shared success.",
  customers: "Build lasting relationships with every customer.",
  calls: "Every conversation brings you closer.",
  staff: "The people behind your progress.",
  performance: "Understand what’s working. Find your next opportunity.",
  users: "Manage your people and their workspace access.",
  settings: "Make ENTRAIN CRM work for your organization.",
};
function WorkspaceSkeleton({ page }) {
  const tablePage = ["users", "staff", "leads", "my-leads", "follow-ups", "calls", "customers"].includes(page);
  return (
    <div className="workspace-content-skeleton" role="status" aria-label="Loading page data">
      <span className="workspace-skeleton-status">Loading workspace…</span>
      <div aria-hidden="true">
        {tablePage ? (
            <div className="workspace-skeleton-panel">
              <span className="workspace-skeleton-tab skeleton-block" />
              <span className="workspace-skeleton-tab skeleton-block" />
              <div className="workspace-skeleton-table-head skeleton-block" />
              {Array.from({ length: 7 }, (_, row) => (
                <div className="workspace-skeleton-table-row" key={row}>
                  <span className="workspace-skeleton-cell skeleton-block" />
                  <span className="workspace-skeleton-cell skeleton-block" />
                  <span className="workspace-skeleton-cell skeleton-block" />
                  <span className="workspace-skeleton-cell skeleton-block" />
                </div>
              ))}
            </div>
        ) : (
            <>
              <div className="workspace-skeleton-stats">
                {Array.from({ length: 4 }, (_, card) => <span className="workspace-skeleton-stat skeleton-block" key={card} />)}
              </div>
              <div className="workspace-skeleton-panels">
                <span className="workspace-skeleton-chart skeleton-block" />
                <span className="workspace-skeleton-chart skeleton-block" />
              </div>
            </>
        )}
      </div>
    </div>
  );
}
function SessionLoading({ page }) {
  return (
    <div className="session-loading">
      <header className="session-loading-header">
        <strong>ENTRAIN <span>ACADEMY</span></strong>
      </header>
      <aside className="session-loading-sidebar">Entrain workspace</aside>
      <main className="session-loading-main">
        <div className="session-loading-breadcrumb">Workspace <ChevronRight size={12} /> {titles[page] || "Dashboard"}</div>
        <div className="session-loading-title">
          <h1>{titles[page] || "Dashboard"}</h1>
          <p>{descriptions[page] || "Your sales workspace."}</p>
        </div>
        <WorkspaceSkeleton page={page} />
      </main>
    </div>
  );
}
export default function CRMApp() {
  const router = useRouter(),
    path = usePathname();
  const page = path.split("/")[1] || "dashboard";
  const detailId = Number(path.split("/")[2]);
  const [role, setRole] = useState("Sales Executive"),
    [authUser, setAuthUser] = useState(null),
    [showPassword, setShowPassword] = useState(false),
    [authError, setAuthError] = useState(""),
    [authBusy, setAuthBusy] = useState(false),
    [leads, setLeads] = useState([]),
    [followups, setFollowups] = useState([]),
    [callsState, setCallsState] = useState([]),
    [tasks, setTasks] = useState([]),
    [people, setPeople] = useState([]),
    [users, setUsers] = useState([]),
    [dataLoading, setDataLoading] = useState(true),
    [usersError, setUsersError] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [drawer, setDrawer] = useState(false),
    [dropdown, setDropdown] = useState(""),
    [search, setSearch] = useState(""),
    [period, setPeriod] = useState("This Month"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(null),
    [read, setRead] = useState(false),
    [hydrated, setHydrated] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthYearStr = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const currentMonthRangeStr = (() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear();
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return `${month} 1 – ${month} ${lastDay}, ${year}`;
  })();
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector('[aria-label="Global search"]')?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const navigate = (p) => {
    router.push(p === "dashboard" ? "/" : "/" + p);
    setDrawer(false);
    setDropdown("");
    setSearch("");
  };
  const notify = (message, type = "success") => setToast({ message, type, id: Date.now() });
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const expire = () => { setAuthUser(null); setHydrated(true); };
    window.addEventListener("entrain-session-expired", expire);
    return () => window.removeEventListener("entrain-session-expired", expire);
  }, []);
  useEffect(() => {
    async function restoreSession() {
      if (!sessionStorage.getItem("entrain-token")) { setHydrated(true); return; }
      const user = await api.me();
      if (user) { setAuthUser(user); setRole(user.role); }
      setHydrated(true);
    }
    restoreSession();
  }, []);
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    setDataLoading(true);
    setUsersError(false);
    async function loadData() {
      try {
        const [leadsData, followupsData, callsData, tasksData, usersData] =
          await Promise.all([
            api.getLeads(),
            api.getFollowups(),
            api.getCalls(),
            api.getTasks(),
            api.getUsers(),
          ]);
        if (cancelled) return;

        if (leadsData && Array.isArray(leadsData)) {
          setLeads(leadsData.map(normalizeLead));
        }
        if (followupsData && Array.isArray(followupsData)) {
          setFollowups(followupsData.map(normalizeLead));
        }
        if (callsData && Array.isArray(callsData)) {
          setCallsState(callsData);
        }
        if (tasksData && Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
        if (Array.isArray(usersData)) {
          const mappedUsers = usersData.map((u) => ({
              ...u,
              id: u.id || u.customId || u._id,
              short: u.short || u.name?.split(" ")[0],
            }));
          setUsers(mappedUsers);
          setPeople(mappedUsers.filter((u) => ["Sales Executive", "Team Lead"].includes(u.role) && u.status === "Active"));
        } else {
          setUsersError(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn("API load error:", err);
        setUsersError(true);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [authUser]);

  const scopedNames = role === "Sales Executive" ? [authUser?.name] : null;
  const userName = authUser?.name || "User";
  const readOnly = ["Super Admin", "Data Analytics Manager"].includes(role);
  const canCreateLead = ["Data Analytics Manager", "Sales Executive"].includes(role);
  const canEditLead = (lead) =>
    role === "Data Analytics Manager" ||
    (role === "Sales Executive" && lead?.assigned === userName) ||
    (role === "Team Lead" && lead?.assigned === userName);
  const canDeleteLead = role === "Data Analytics Manager";
  const canAssignLead = role === "Data Analytics Manager";
  const canWorkRecord = (record) =>
    !readOnly && (role !== "Team Lead" || record?.assigned === userName);
  const assignmentNames = role === "Team Lead" ? [userName] : scopedNames;
  const scopedLeads = leads.filter(
    (l) => !scopedNames || scopedNames.includes(l.assigned),
  );
  const scopedFollowups = followups.filter(
    (l) => !scopedNames || scopedNames.includes(l.assigned),
  );
  const allowed =
    access[role].includes(page) ||
    (page === "leads" && detailId && role === "Sales Executive");
  const updateLead = async (lead, { silent = false } = {}) => {
    if (!canEditLead(lead)) { notify("You can only update your assigned leads.", "error"); return false; }
    const saved = await api.updateLead(lead.id, lead);
    if (!saved) { notify("Could not save lead. Please try again.", "error"); return false; }
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? normalizeLead(saved) : l)));
    if (!silent) notify("Lead updated");
    return true;
  };
  const deleteLead = async (lead) => {
    if (!canDeleteLead || !lead) return;
    const deleted = await api.deleteLead(lead.id);
    if (!deleted) { notify("Could not delete lead. Please try again.", "error"); return; }
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setFollowups((prev) => prev.filter((item) => String(item.leadId) !== String(lead.customId ?? lead.id)));
    setModal(null);
    if (detailId === lead.id) navigate("leads");
    notify("Lead deleted");
  };
  const changeUserStatus = async (account) => {
    if (role !== "Super Admin") return;
    if (account._id === authUser?._id || account.email === authUser?.email) {
      notify("You cannot change your own account status.", "error");
      return;
    }
    try {
      const saved = await api.updateUser(account.id, {
        status: account.status === "Active" ? "Inactive" : "Active",
      });
      const nextUsers = users.map((user) => user.id === account.id ? saved : user);
      setUsers(nextUsers);
      setPeople(nextUsers.filter((user) => ["Sales Executive", "Team Lead"].includes(user.role) && user.status === "Active"));
      notify(`${account.name} ${saved.status === "Active" ? "activated" : "deactivated"}`);
    } catch (error) {
      notify(error.message, "error");
    }
  };
  function exportData(rows, name, format = "csv") {
    if (!rows.length) {
      notify("No records to export", "error");
      return;
    }
    const fields = Object.keys(rows[0]).filter(
      (k) => typeof rows[0][k] !== "object",
    );
    let content, type;
    if (format === "xls") {
      const esc = (v) =>
        String(v ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;");
      content =
        '<html><meta charset="utf-8"><table><tr>' +
        fields.map((k) => "<th>" + esc(k) + "</th>").join("") +
        "</tr>" +
        rows
          .map(
            (r) =>
              "<tr>" +
              fields.map((k) => "<td>" + esc(r[k]) + "</td>").join("") +
              "</tr>",
          )
          .join("") +
        "</table></html>";
      type = "application/vnd.ms-excel";
    } else {
      const cell = (v) =>
        '"' +
        String(v ?? "")
          .replace(/^[=+@-]/, "'")
          .replaceAll('"', '""') +
        '"';
      content =
        "\uFEFF" +
        [fields, ...rows.map((r) => fields.map((k) => r[k]))]
          .map((r) => r.map(cell).join(","))
          .join("\r\n");
      type = "text/csv;charset=utf-8";
    }
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrain-${name}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Your export is ready");
  }
  async function saveForm(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const todayStr = new Date().toISOString().split("T")[0];
    if (modal.type === "assignment") {
      if (!canAssignLead || !modal.record || !people.some((person) => person.name === data.assigned)) {
        notify("Choose an active Team Lead or Sales Executive.", "error");
        return;
      }
      const saved = await api.updateLead(modal.record.id, { assigned: data.assigned });
      if (!saved) { notify("Could not assign lead. Please try again.", "error"); return; }
      setLeads(leads.map((lead) => lead.id === modal.record.id ? normalizeLead(saved) : lead));
      setFollowups(followups.map((followup) => followup.leadId === saved.customId ? { ...followup, assigned: data.assigned } : followup));
      notify("Lead assigned");
      setModal(null);
      return;
    }
    if (modal.type === "lead") {
      if (modal.record ? !canEditLead(modal.record) : !canCreateLead) {
        notify("You do not have permission to save this lead.", "error");
        return;
      }
      const saleAmount = Number(data.saleAmount),
        advanceAmount = Number(data.advanceAmount);
      const selectedCourse = courses.find((course) => course.name === data.service);
      if (!selectedCourse) {
        notify("Select an interested course.", "error");
        return;
      }
      if (role === "Sales Executive") data.assigned = userName;
      if (!data.assigned) {
        notify("Select a Team Lead or Sales Executive", "error");
        return;
      }
      if (
        !Number.isFinite(saleAmount) ||
        saleAmount < 0 ||
        !Number.isFinite(advanceAmount) ||
        advanceAmount < 0 ||
        advanceAmount > saleAmount
      ) {
        notify("Advance amount must be between ₹0 and the sale amount", "error");
        return;
      }
      const newNote = String(data.initialNote || "").trim();
      delete data.initialNote;
      const lead = {
        ...modal.record,
        ...data,
        saleAmount,
        advanceAmount,
        id: modal.record?.id || Date.now(),
        created: modal.record?.created || todayStr,
        date: data.date || modal.record?.date || todayStr,
        time: data.time || modal.record?.time || "10:30",
        notes: [
          ...(modal.record?.notes || []),
          ...(newNote ? [{ text: newNote, author: userName }] : []),
        ],
        activities: modal.record?.activities || [
          { text: "Lead created for " + data.service, time: "Just now" },
          { text: "Assigned to " + data.assigned, time: "Just now" },
          ...(advanceAmount > 0
            ? [
                {
                  text: "Advance of " + money(advanceAmount) + " recorded",
                  time: "Just now",
                },
              ]
            : []),
        ],
      };
      if (modal.record) {
        const saved = await api.updateLead(lead.id, lead);
        if (!saved) { notify("Could not save lead. Please try again.", "error"); return; }
        setLeads(leads.map((l) => (l.id === lead.id ? normalizeLead(saved) : l)));
      } else {
        const saved = await api.createLead(lead);
        if (!saved) { notify("Could not add lead. Please try again.", "error"); return; }
        setLeads([normalizeLead(saved), ...leads]);
      }
      notify(modal.record ? "Lead updated" : "Lead added successfully");
    }
    if (modal.type === "followup") {
      const lead = leads.find((l) => l.id === Number(data.leadId)) || {};
      if (!lead.id || !canWorkRecord(lead) || (modal.record && !canWorkRecord(modal.record))) {
        notify("You can only schedule follow-ups for your assigned leads.", "error");
        return;
      }
      const f = {
        ...lead,
        ...data,
        id: modal.record?.id || Date.now(),
        leadId: lead.id || data.leadId,
        completed: false,
        purpose: data.notes || "Follow up with customer",
      };
      if (modal.record) {
        const saved = await api.updateFollowup(f.id, f);
        if (!saved) { notify("Could not save follow-up. Please try again.", "error"); return; }
        setFollowups(followups.map((x) => (x.id === f.id ? normalizeLead(saved) : x)));
      } else {
        const saved = await api.createFollowup(f);
        if (!saved) { notify("Could not add follow-up. Please try again.", "error"); return; }
        setFollowups([normalizeLead(saved), ...followups]);
      }
      if (lead.id) {
        const leadUpdated = await updateLead({
          ...lead,
          date: data.date,
          time: data.time,
          activities: [
            ...(lead.activities || []),
            {
              text: "Follow-up scheduled for " + data.date + " at " + data.time,
              time: "Just now",
            },
          ],
        }, { silent: true });
        if (!leadUpdated) {
          setModal(null);
          notify("Follow-up saved, but the lead date could not be updated.", "error");
          return;
        }
      }
      notify(modal.record ? "Follow-up updated" : "Follow-up added");
    }
    if (modal.type === "user") {
      if (role !== "Super Admin") { notify("Only the Super Admin can manage accounts.", "error"); return; }
      const u = {
        ...modal.record,
        ...data,
        id: modal.record?.id || Date.now(),
        status: modal.record?.status || "Active",
      };
      try {
        const saved = modal.record
          ? await api.updateUser(modal.record.id, u)
          : await api.createUser(u);
        const nextUsers = modal.record
          ? users.map((x) => (x.id === u.id ? saved : x))
          : [saved, ...users];
        setUsers(nextUsers);
        setPeople(nextUsers.filter((account) => ["Sales Executive", "Team Lead"].includes(account.role) && account.status === "Active"));
        notify(modal.record ? "User updated" : "User added");
      } catch (error) {
        notify(error.message, "error");
        return;
      }
    }
    setModal(null);
  }
  const field = (label, name, type = "text", options, defaultValue) => (
    <label key={name}>
      {label}
      {options ? (
        <select
          name={name}
          defaultValue={defaultValue ?? modal?.record?.[name] ?? options[0]}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea name={name} defaultValue={modal?.record?.[name] || ""} />
      ) : (
        <input
          name={name}
          type={type}
          required={["name", "phone", "date", "time"].includes(name)}
          defaultValue={defaultValue ?? modal?.record?.[name] ?? ""}
        />
      )}
    </label>
  );
  if (!hydrated) return <SessionLoading page={page} />;
  if (!authUser)
    return (
      <div className="auth-screen">
        <div className="auth-shell">
          <aside className="auth-story">
            <div className="auth-story-brand"><span className="auth-story-mark">E</span><span>ENTRAIN <strong>CRM</strong></span></div>
            <div className="auth-story-copy">
              <span className="auth-eyebrow">YOUR SALES WORKSPACE</span>
              <h1>Make every conversation count.</h1>
              <p>Keep leads, follow-ups and sales progress together in one clear workspace.</p>
              <div className="auth-story-points">
                <span><Users size={18} /> Know every opportunity</span>
                <span><CalendarClock size={18} /> Stay ahead of follow-ups</span>
                <span><ChartNoAxesCombined size={18} /> See your progress clearly</span>
              </div>
            </div>
            <span className="auth-story-footer">ENTRAIN ACADEMY · SALES WORKSPACE</span>
          </aside>
          <section className="auth-panel" aria-label="Account access">
            <div className="auth-panel-inner">
              <div className="auth-logo"><img src="/images/entrain-logo.png" alt="ENTRAIN Academy" /><span>CRM</span></div>
              <form className="auth-form" onSubmit={async (e) => {
                e.preventDefault();
                setAuthError("");
                const values = Object.fromEntries(new FormData(e.currentTarget));
                setAuthBusy(true);
                try {
                  const user = await api.login(values.email, values.password);
                  setDataLoading(true);
                  setAuthUser(user);
                  setRole(user.role);
                  navigate("dashboard");
                } catch (error) { setAuthError(error.message); }
                finally { setAuthBusy(false); }
              }}>
                <div className="auth-form-intro">
                  <span className="auth-eyebrow">WELCOME BACK</span>
                  <h2>Sign in to your workspace</h2>
                  <p>Enter the credentials provided by your administrator.</p>
                </div>
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label>Password<div className="auth-password"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label>
                {authError && <div className="auth-error" role="alert">{authError}</div>}
                <button className="primary auth-submit" type="submit" disabled={authBusy}>{authBusy ? "Signing in…" : "Sign in"}<ArrowUpRight size={17} /></button>
                <p className="auth-help">Need an account? Ask your workspace administrator.</p>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  return (
    <div className={`app ${collapsed ? "is-collapsed" : ""}`}>
      <header className="navbar">
        <button
          className="mobile-menu icon-button"
          aria-label="Open navigation"
          onClick={() => setDrawer(!drawer)}
        >
          <Menu size={20} />
        </button>
        <a
          className="brand"
          href="/"
          aria-label="ENTRAIN Academy CRM"
          onClick={(e) => {
            e.preventDefault();
            navigate("dashboard");
          }}
        >
          <span className="brand-crest">
            <img src="/images/entrain-logo.png" alt="" />
          </span>
          <span className="brand-wordmark">
            <strong>ENTRAIN</strong>
            <span>ACADEMY</span>
          </span>
        </a>
        <div className="nav-divider" />
        <span className="workspace-name">
          Workspace <ChevronDown size={12} />
        </span>
        <div className="global-search">
          <Search size={16} />
          <input
            aria-label="Global search"
            placeholder="Search anything…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd>⌘ K</kbd>
          {search && (
            <div className="search-results">
              <div className="dropdown-title">Search results</div>
              {scopedLeads
                .filter((l) =>
                  (l.name + l.phone)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .slice(0, 5)
                .map((l) => (
                  <button key={l.id} onClick={() => navigate("leads/" + l.id)}>
                    <UserAvatar name={l.name} />
                    <span>
                      {l.name}
                      <small>Lead · {l.phone}</small>
                    </span>
                    <ChevronRight size={13} />
                  </button>
                ))}
              {people
                .filter((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 3)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setModal({ type: "employee", record: p });
                      setSearch("");
                    }}
                  >
                    <UserAvatar name={p.name} />
                    <span>
                      {p.name}
                      <small>{p.role}</small>
                    </span>
                  </button>
                ))}
              {!scopedLeads.some((l) =>
                (l.name + l.phone).toLowerCase().includes(search.toLowerCase()),
              ) &&
                !people.some((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()),
                ) && <EmptyState compact description="Try a different name or phone number." />}
            </div>
          )}
        </div>
        <div className="nav-actions">
          <span className="demo-pill">ENTRAIN CRM</span>
          <button
            className="notification-button icon-button"
            aria-label="Notifications"
            onClick={() =>
              setDropdown(dropdown === "notifications" ? "" : "notifications")
            }
          >
            <Bell size={18} />
            {!read && <i />}
          </button>
          <span className="nav-divider" />
          <button
            className="profile-button"
            onClick={() => setDropdown(dropdown === "profile" ? "" : "profile")}
          >
            <UserAvatar name={userName} />
            <span>
              <strong>{userName}</strong>
              <small>{role}</small>
            </span>
            <ChevronDown size={13} />
          </button>
        </div>
        {dropdown === "notifications" && (
          <div className="nav-dropdown notifications">
            <div className="dropdown-title">
              Notifications
              <button className="text-button" onClick={() => setRead(true)}>
                Mark all read
              </button>
            </div>
            {notifications.map((n, i) => (
              <button
                key={n}
                onClick={() => {
                  notify(n);
                  setRead(true);
                }}
              >
                <span className={`notification-dot ${read ? "read" : ""}`} />
                <span>
                  {n}
                  <small>
                    {i + 1} hour{i ? "s" : ""} ago
                  </small>
                </span>
              </button>
            ))}
          </div>
        )}
        {dropdown === "profile" && (
          <div className="nav-dropdown profile-dropdown">
            <strong>{userName}</strong>
            <small>{authUser.email}</small>
            <button
              onClick={() => {
                setModal({ type: "profile" });
                setDropdown("");
              }}
            >
              <UserRound size={15} /> My Profile
            </button>
            {role === "Super Admin" && (
              <button onClick={() => navigate("settings")}>
                <Settings size={15} /> Settings
              </button>
            )}
            <button
              onClick={() => {
                setModal({ type: "logout" });
                setDropdown("");
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </header>
      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
      )}
      <aside className={`sidebar ${drawer ? "drawer-open" : ""}`}>
        <div className="workspace-switch">
          <span className="workspace-icon">
            <img src="/images/entrain-logo.png" alt="" />
          </span>
          <div>
            <strong>Entrain workspace</strong>
          </div>
          <ChevronDown size={13} />
        </div>
        <nav>
          {navGroups.map(([heading, items]) => {
            const visible = items.filter((x) => access[role].includes(x[0]));
            if (!visible.length) return null;
            return (
              <div className="nav-group" key={heading}>
                {heading && <div className="nav-group-label">{heading}</div>}
                {visible.map(([id, label, Icon]) => (
                  <a
                    key={id}
                    href={id === "dashboard" ? "/" : "/" + id}
                    title={label}
                    className={`nav-item ${page === id ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(id);
                    }}
                  >
                    <Icon size={17} />
                    <span>
                      {id === "customers" && role === "Sales Executive"
                          ? "My Customers"
                          : label}
                    </span>
                    {id === "leaderboard" && <i className="nav-new" />}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button
            onClick={() =>
              notify("Need a hand? Contact your workspace administrator.")
            }
          >
            <LifeBuoy size={17} />
            <span>Help & support</span>
            <ArrowUpRight size={13} />
          </button>
          <button onClick={() => setCollapsed(!collapsed)}>
            <PanelLeftClose size={17} />
            <span>Collapse sidebar</span>
            <ChevronsLeft size={13} />
          </button>
          <div className="sidebar-version">
            <span className="live-dot" /> ENTRAIN CRM <small>v1.0</small>
          </div>
        </div>
      </aside>
      <main
        className={
          ["follow-ups", "calls", "customers", "staff", "users"].includes(page)
            ? "main table-page"
            : "main"
        }
      >
        <div className="breadcrumb">
          Workspace <ChevronRight size={12} />
          <span>{titles[page] || "Dashboard"}</span>
          <div className="breadcrumb-right">
            <span className="live-dot" /> {currentMonthYearStr}
          </div>
        </div>
        {!allowed ? (
          <section className="card detail-card">
            <ShieldCheck />
            <h1>This screen isn’t available for {role}</h1>
            <p>Choose a permitted screen or switch your demo role.</p>
            <button onClick={() => navigate("dashboard")}>
              Go to dashboard
            </button>
          </section>
        ) : (
          <>
            {!detailId && (
              <PageHeader
                title={
                  page === "dashboard"
                    ? `Good morning, ${userName.split(" ")[0]}`
                    : titles[page] || "Reports"
                }
                description={
                  page === "dashboard"
                    ? role === "HR"
                      ? "Here’s what’s happening with your people today."
                      : "Here’s what’s happening with your sales today."
                    : descriptions[page] ||
                      "Turn your data into clarity. Make every decision count."
                }
              >
                {page === "dashboard" ? (
                  <>
                    <button
                      className="date-button"
                      onClick={() =>
                        setPeriod(period === "Custom" ? "This Month" : "Custom")
                      }
                    >
                      <CalendarClock size={15} /> {currentMonthRangeStr}{" "}
                      <ChevronDown size={13} />
                    </button>
                    {canCreateLead && (
                      <button
                        className="primary"
                      disabled={dataLoading}
                        onClick={() => setModal({ type: "lead" })}
                      >
                        <Plus size={16} /> Add lead
                      </button>
                    )}
                  </>
                ) : ["leads", "my-leads", "pipeline"].includes(page) && canCreateLead ? (
                  <button
                    className="primary"
                    disabled={dataLoading}
                    onClick={() => setModal({ type: "lead" })}
                  >
                    <Plus size={16} /> Add lead
                  </button>
                ) : page === "follow-ups" && !readOnly ? (
                  <button
                    className="primary"
                    onClick={() => setModal({ type: "followup" })}
                  >
                    <Plus size={16} /> Add follow-up
                  </button>
                ) : page === "users" && role === "Super Admin" ? (
                  <button
                    className="primary"
                    disabled={dataLoading}
                    onClick={() => setModal({ type: "user" })}
                  >
                    <Plus size={16} /> Add user
                  </button>
                ) : page.includes("reports") ? (
                  <button onClick={() => exportData(people, page)}>
                    <Download size={15} /> Export report
                  </button>
                ) : null}
              </PageHeader>
            )}
            {dataLoading && !["settings", "users"].includes(page) ? (
              <WorkspaceSkeleton page={page} />
            ) : (
              <>
            {(page === "dashboard" || page.includes("reports")) && (
              <div
                className={`period-row ${page === "dashboard" ? "dashboard-period-row" : ""}`}
              >
                <DateRangeFilter value={period} onChange={setPeriod} />
                {page === "dashboard" && (
                  <span className="muted">
                    <CalendarClock size={13} /> {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            )}
            {page === "dashboard" && (
              <Dashboard
                role={role}
                leads={scopedLeads}
                people={people}
                staff={users}
                followups={scopedFollowups}
                calls={callsState}
                navigate={navigate}
                openModal={setModal}
                period={period}
                readOnly={readOnly}
                canWorkRecord={canWorkRecord}
              />
            )}
            {["leads", "my-leads"].includes(page) &&
              (detailId ? (
                <LeadDetails
                  lead={scopedLeads.find((l) => l.id === detailId)}
                  openModal={setModal}
                  notify={notify}
                  updateLead={updateLead}
                  navigate={navigate}
                  readOnly={readOnly || !canEditLead(scopedLeads.find((l) => l.id === detailId))}
                  canEditLead={canEditLead(scopedLeads.find((l) => l.id === detailId))}
                  canDeleteLead={canDeleteLead}
                  canAssignLead={canAssignLead}
                />
              ) : (
                <LeadsPage
                  leads={
                    page === "my-leads"
                      ? scopedLeads.filter(
                          (l) =>
                            l.assigned === userName,
                        )
                      : scopedLeads
                  }
                  navigate={navigate}
                  openModal={setModal}
                  exportData={exportData}
                  readOnly={role === "Super Admin"}
                  canEditLead={canEditLead}
                  canDeleteLead={canDeleteLead}
                  canAssignLead={canAssignLead}
                />
              ))}
            {page === "follow-ups" && (
              <FollowupsPage
                followups={scopedFollowups}
                setFollowups={(next) =>
                  setFollowups([
                    ...followups.filter(
                      (f) => !scopedFollowups.some((s) => s.id === f.id),
                    ),
                    ...next,
                  ])
                }
                openModal={setModal}
                navigate={navigate}
                notify={notify}
                readOnly={readOnly}
                canWorkRecord={canWorkRecord}
              />
            )}
            {page === "pipeline" && (
              <PipelinePage
                leads={scopedLeads}
                navigate={navigate}
                updateLead={updateLead}
                readOnly={readOnly}
                canEditLead={canEditLead}
              />
            )}
            {page === "calls" && (
              <CallsPage calls={callsState} allowedNames={scopedNames} notify={notify} readOnly={readOnly} canWorkRecord={canWorkRecord} />
            )}
            {page === "customers" && (
              <CustomersPage leads={scopedLeads} navigate={navigate} />
            )}
            {page === "leaderboard" && <LeaderboardPage people={people} />}
            {page === "targets" && (
              <TargetsPage
                people={people}
                setPeople={setPeople}
                notify={notify}
              />
            )}
            {page === "staff" && (
              <StaffPage
                people={users}
                leads={scopedLeads}
                calls={callsState}
                followups={scopedFollowups}
                openModal={setModal}
              />
            )}
            {(page === "performance" || page.includes("reports")) && (
              <AnalyticsPage
                page={page}
                people={
                  scopedNames
                    ? people.filter((p) => scopedNames.includes(p.name))
                    : people
                }
                leads={scopedLeads}
                followups={scopedFollowups}
                calls={callsState}
                period={period}
                onPeriodChange={setPeriod}
                exportData={exportData}
              />
            )}
            {page === "users" && (
              <UsersPage
                users={users}
                loading={dataLoading}
                loadError={usersError}
                openModal={setModal}
                onStatusChange={changeUserStatus}
                canManage={role === "Super Admin"}
              />
            )}
            {page === "settings" && <SettingsPage notify={notify} />}
            {page === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} />}
              </>
            )}
          </>
        )}
      </main>
      {modal && !["logout", "delete-lead"].includes(modal.type) && (
        <Modal
          title={
            modal.type === "lead"
              ? modal.record
                ? "Edit lead"
                : "Add a new lead"
              : modal.type === "assignment"
                ? "Assign lead"
              : modal.type === "followup"
                ? modal.record
                  ? "Reschedule follow-up"
                  : "Add follow-up"
                : modal.type === "user"
                  ? modal.record
                    ? "Edit user"
                    : "Add user"
                  : modal.type === "profile"
                    ? "My profile"
                    : "Employee information"
          }
          onClose={() => setModal(null)}
        >
          {["lead", "assignment", "followup", "user"].includes(modal.type) ? (
            <form className={modal.type === "user" ? "account-form" : undefined} onSubmit={saveForm}>
              {modal.type === "user" && <div className="account-form-intro"><strong>{modal.record ? "Update account" : "Create a user account"}</strong><span>{modal.record ? "Edit the user’s details, role and access." : "Choose a role and temporary password. Share the sign-in details with the user."}</span></div>}
              <div className="form-grid">
                {modal.type === "assignment" && (
                  <label>
                    Assign {modal.record?.name} to
                    <select name="assigned" required defaultValue={modal.record?.assigned || ""}>
                      <option value="" disabled>Select a team member</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.name}>{person.name} · {person.role}</option>
                      ))}
                    </select>
                  </label>
                )}
                {modal.type === "lead" && (
                  <>
                    {field("Customer name", "name")}
                    {field("Phone number", "phone", "tel")}
                    {field("WhatsApp number", "whatsapp", "tel")}
                    {field("Email", "email", "email")}
                    {field("Location", "location")}
                    <div className="course-field">
                      <span>Interested course</span>
                      <CourseCombobox
                        key={modal.record?.id || "new-lead"}
                        courses={courses}
                        defaultValue={modal.record?.service || ""}
                        onSelect={(course, form) => {
                          const amount = form?.elements.namedItem("saleAmount");
                          if (amount && !amount.dataset.edited)
                            amount.value = String(courseFees[course.name] || 0);
                        }}
                      />
                    </div>
                    {field("Lead source", "source", "text", modal.record?.source && !sources.includes(modal.record.source) ? [...sources, modal.record.source] : sources, modal.record?.source || "Facebook")}
                    {field("Priority", "priority", "text", modal.record?.priority && !priorities.includes(modal.record.priority) ? [...priorities, modal.record.priority] : priorities, modal.record?.priority || "Warm")}
                    {role !== "Sales Executive" && (
                      <label>
                        Assign to Team Lead or Sales Executive
                        <select
                          name="assigned"
                          required
                          defaultValue={
                            modal.record?.assigned ||
                            (assignmentNames?.length === 1 ? assignmentNames[0] : "")
                          }
                        >
                          <option value="" disabled>
                            Select a team member
                          </option>
                          {modal.record?.assigned && !people.some((person) => person.name === modal.record.assigned) && (
                            <option value={modal.record.assigned}>{modal.record.assigned} (inactive)</option>
                          )}
                          {people
                            .filter(
                              (p) => !assignmentNames || assignmentNames.includes(p.name),
                            )
                            .map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    {field("Status", "status", "text", modal.record?.status && !statuses.includes(modal.record.status) ? [...statuses, modal.record.status] : statuses, modal.record?.status || "Contacted")}
                    {field("Next follow-up", "date", "date", null, modal.record?.date || todayStr)}
                    {field("Follow-up time", "time", "time", null, modal.record?.time || "10:30")}
                    <label>
                      Sale amount (₹)
                      <input
                        name="saleAmount"
                        type="number"
                        min="0"
                        step="1"
                        required
                        defaultValue={
                          modal.record?.saleAmount ??
                          courseFees[
                            modal.record?.service
                          ] ??
                          0
                        }
                        onInput={(e) =>
                          (e.currentTarget.dataset.edited = "true")
                        }
                      />
                      <small className="field-hint">
                        Demo course fee. Enter the agreed sale amount.
                      </small>
                    </label>
                    <label>
                      Advance amount (₹)
                      <input
                        name="advanceAmount"
                        type="number"
                        min="0"
                        step="1"
                        required
                        defaultValue={modal.record?.advanceAmount ?? 0}
                      />
                    </label>
                    {field("Add note", "initialNote", "textarea")}
                  </>
                )}
                {modal.type === "followup" && (
                  <>
                    <label>
                      Customer
                      <select
                        name="leadId"
                        defaultValue={
                          modal.record?.leadId ||
                          modal.lead?.id ||
                          scopedLeads.find((lead) => canWorkRecord(lead))?.id
                        }
                      >
                        {scopedLeads.filter((lead) => canWorkRecord(lead)).map((l) => (
                          <option value={l.id} key={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {field("Follow-up type", "type", "text", [
                      "Call",
                      "WhatsApp",
                      "Meeting",
                      "Email",
                      "Other",
                    ])}
                    {field(
                      "Date",
                      "date",
                      "date",
                      null,
                      modal.record?.date || todayStr,
                    )}
                    {field(
                      "Time",
                      "time",
                      "time",
                      null,
                      modal.record?.time || "10:30",
                    )}
                    {field("Notes / purpose", "notes", "textarea")}
                  </>
                )}
                {modal.type === "user" && (
                  <>
                    {field("Name", "name")}
                    {field("Email", "email", "email")}
                    <label>{modal.record ? "New password (optional)" : "Temporary password"}<input name="password" type="password" minLength="8" required={!modal.record} autoComplete="new-password" /></label>
                    {field("Phone", "phone", "tel")}
                    {field("Role", "role", "text", modal.record?.role && !roles.includes(modal.record.role) ? [...roles, modal.record.role] : roles)}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="primary" type="submit">
                  {modal.type === "assignment"
                    ? "Assign lead"
                    : modal.type === "followup"
                    ? "Save follow-up"
                    : modal.type === "user"
                      ? modal.record ? "Save changes" : "Create user"
                      : modal.record ? "Save changes" : "Save lead"}
                  <Check size={15} />
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-detail">
              <UserAvatar name={modal.record?.name || userName} size="large" />
              <h2>{modal.record?.name || userName}</h2>
              <p>
                {modal.record?.role || role} ·{" "}
                Entrain workspace
              </p>
              <p>
                {modal.record?.name?.toLowerCase().replace(" ", ".") ||
                  "shamil"}
                @entrain.in
              </p>
              <p>+91 98470 12345</p>
              <StatusBadge status="Active" />
              {modal.record && (
                <p>
                  Sales: {money(modal.record.sales)} · Conversions:{" "}
                  {modal.record.conversions}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
      {modal?.type === "logout" && (
        <ConfirmDialog
          title="Log out of workspace?"
          onClose={() => setModal(null)}
          onConfirm={() => {
            setModal(null);
            api.logout();
            setAuthUser(null);
            setLeads([]);
            setFollowups([]);
            setCallsState([]);
            setTasks([]);
            setUsers([]);
            setPeople([]);
            setDataLoading(true);
          }}
        />
      )}
      {modal?.type === "delete-lead" && (
        <ConfirmDialog
          title={`Delete ${modal.record?.name}?`}
          message="This will permanently remove the lead and its follow-ups."
          confirmLabel="Delete lead"
          destructive
          onClose={() => setModal(null)}
          onConfirm={() => deleteLead(modal.record)}
        />
      )}
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
          {toast.type === "error" ? <CircleAlert size={17} /> : <Check size={17} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
