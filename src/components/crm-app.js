"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarClock,
  Columns3,
  Trophy,
  Target,
  Phone,
  ChartNoAxesCombined,
  FileChartColumn,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Plus,
  ArrowUpRight,
  LogOut,
  Check,
  CircleAlert,
  Command,
  BriefcaseBusiness,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
  ExportMenu,
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
  statuses,
  convertedStatuses,
  sources,
  priorities,
  money,
  courses,
  courseFees,
  normalizeLead,
  normalizeFollowup,
} from "@/lib/data";
import { downloadExport } from "@/lib/export";
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function CallModalFields({ modal, scopedLeads, people, assignmentNames, role, userName, courses, todayStr }) {
  const [selectedLeadId, setSelectedLeadId] = useState(
    modal.record?.leadId || modal.record?.customId || modal.record?.id || ""
  );
  const selectedLead = scopedLeads.find(
    (l) => String(l.id) === String(selectedLeadId) || String(l.customId) === String(selectedLeadId)
  );

  const [customerName, setCustomerName] = useState(modal.record?.name || selectedLead?.name || "");
  const [phone, setPhone] = useState(modal.record?.phone || selectedLead?.phone || "");
  const [service, setService] = useState(modal.record?.service || selectedLead?.service || courses[0]?.name || "");

  const handleLeadChange = (e) => {
    const val = e.target.value;
    setSelectedLeadId(val);
    if (val === "custom") {
      setCustomerName("");
      setPhone("");
    } else {
      const match = scopedLeads.find((l) => String(l.id) === String(val) || String(l.customId) === String(val));
      if (match) {
        setCustomerName(match.name);
        setPhone(match.phone || match.whatsapp || "");
        if (match.service) setService(match.service);
      }
    }
  };

  const isExistingLead = Boolean(selectedLead || scopedLeads.some((l) => l.phone && phone && l.phone === phone));
  const nowTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <>
      <label>
        Link to existing lead
        <select value={selectedLead ? (selectedLead.id || selectedLead.customId) : (selectedLeadId ? selectedLeadId : "custom")} onChange={handleLeadChange}>
          <option value="custom">-- Unknown / Unsaved Number --</option>
          {scopedLeads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.phone || "No phone"})
            </option>
          ))}
        </select>
      </label>

      <label>
        Customer name
        <input
          name="name"
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. John Doe or Unknown Caller"
        />
      </label>

      <label>
        Phone number
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            name="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            style={{ flex: 1 }}
          />
          {phone && (
            <a
              href={`tel:${phone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                background: "var(--card-bg, #f1f5f9)",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "13px",
                color: "var(--text, #0f172a)",
                fontWeight: 500,
                border: "1px solid var(--border, #cbd5e1)"
              }}
              title="Click to dial this number directly"
            >
              <Phone size={14} /> Dial
            </a>
          )}
        </div>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label>
          Call direction
          <select name="direction" defaultValue={modal.record?.direction || "Outgoing"}>
            <option value="Outgoing">Outgoing (We called)</option>
            <option value="Incoming">Incoming (They called)</option>
          </select>
        </label>

        <label>
          Call status / outcome
          <select name="callStatus" defaultValue={modal.record?.callStatus || "Answered"}>
            <option value="Answered">Answered</option>
            <option value="Missed">Missed</option>
            <option value="Busy">Busy</option>
            <option value="Voicemail">Voicemail</option>
            <option value="Disconnected">Disconnected</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label>
          Duration
          <input name="duration" type="text" defaultValue={modal.record?.duration || "01:30"} placeholder="mm:ss (e.g. 02:45)" />
        </label>

        <label>
          Course / Service
          <select name="service" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">General Inquiry</option>
            {courses.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {!["Team Lead", "Sales Executive"].includes(role) && (
        <label>
          Assigned executive
          <select name="assigned" defaultValue={modal.record?.assigned || userName}>
            {people
              .filter((p) => !assignmentNames || assignmentNames.includes(p.name))
              .map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
          </select>
        </label>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label>
          Call date
          <input name="callDate" type="date" defaultValue={todayStr} />
        </label>
        <label>
          Call time
          <input name="callTime" type="time" defaultValue={nowTime} />
        </label>
      </div>

      <label>
        Call notes & discussion summary
        <textarea
          name="notes"
          rows={3}
          placeholder="What was discussed during this call?"
          defaultValue={modal.record?.notes || ""}
        />
      </label>

      {!isExistingLead && (
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "var(--text, #1e293b)" }}>
          <input type="checkbox" name="createAsLead" defaultChecked={true} style={{ width: "auto", margin: 0 }} />
          <span>Save this unknown number as a new lead in CRM</span>
        </label>
      )}
    </>
  );
}

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
    [leaderboardPeople, setLeaderboardPeople] = useState([]),
    [leaderboardLoadError, setLeaderboardLoadError] = useState(false),
    [users, setUsers] = useState([]),
    [dataLoading, setDataLoading] = useState(true),
    [usersError, setUsersError] = useState(false),
    [leadsError, setLeadsError] = useState(false),
    [leadsRefreshing, setLeadsRefreshing] = useState(false),
    [leadsReload, setLeadsReload] = useState(0),
    [collapsed, setCollapsed] = useState(false),
    [reportsOpen, setReportsOpen] = useState(page.endsWith("-reports")),
    [drawer, setDrawer] = useState(false),
    [dropdown, setDropdown] = useState(""),
    [search, setSearch] = useState(""),
    [period, setPeriod] = useState("This Month"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(null),
    [userNotifications, setUserNotifications] = useState([]),
    [hydrated, setHydrated] = useState(false);
  const notificationButtonRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const accountButtonRef = useRef(null);
  const accountPanelRef = useRef(null);
  useEffect(() => {
    if (!dropdown) return;
    const trigger = dropdown === "notifications" ? notificationButtonRef.current : accountButtonRef.current;
    const panel = dropdown === "notifications" ? notificationPanelRef.current : accountPanelRef.current;
    const closeIfOutside = (event) => {
      if (!trigger?.contains(event.target) && !panel?.contains(event.target)) setDropdown("");
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDropdown("");
    };
    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("focusin", closeIfOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("focusin", closeIfOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dropdown]);
  const todayStr = new Date().toISOString().split("T")[0];
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
    if (!p.endsWith("-reports")) setReportsOpen(false);
    setDrawer(false);
    setDropdown("");
    setSearch("");
  };
  useEffect(() => {
    if (page.endsWith("-reports")) setReportsOpen(true);
  }, [page]);
  const notify = (message, type = "success") => setToast({ message, type, id: Date.now() });
  const markAllRead = async () => {
    if (!await api.markAllNotificationsRead()) { notify("Could not mark notifications as read.", "error"); return; }
    setUserNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
  };
  const openNotification = async (item) => {
    if (!item.readAt) {
      const saved = await api.markNotificationRead(item._id);
      if (saved) setUserNotifications((items) => items.map((entry) => entry._id === item._id ? saved : entry));
      else notify("Could not mark notification as read.", "error");
    }
    if (item.leadCustomId) navigate(`${role === "Sales Executive" || role === "Team Lead" ? "my-leads" : "leads"}/${item.leadCustomId}`);
    else setDropdown("");
  };
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
    setLeadsError(false);
    async function loadData() {
      try {
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const [leadsData, followupsData, callsData, tasksData, usersData, leaderboardData] =
          await Promise.all([
            api.getLeads(),
            api.getFollowups(),
            api.getCalls(),
            api.getTasks(),
            api.getUsers(),
            api.getLeaderboard({ startDate: dateKey(monthStart), endDate: dateKey(monthEnd) }),
          ]);
        if (cancelled) return;

        if (Array.isArray(leadsData)) {
          setLeads(leadsData.map(normalizeLead));
        } else {
          setLeadsError(true);
        }
        if (followupsData && Array.isArray(followupsData)) {
          setFollowups(followupsData.map(normalizeFollowup));
        }
        if (callsData && Array.isArray(callsData)) {
          setCallsState(callsData);
        }
        if (tasksData && Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
        if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
          setLeaderboardPeople(leaderboardData);
        } else if (Array.isArray(usersData) && Array.isArray(leadsData)) {
          const eligibleUsers = usersData.filter((user) =>
            ["Sales Executive", "Team Lead"].includes(user.role) &&
            user.status === "Active" && user.leaderboardVisible !== false
          );
          const startTime = new Date(`${dateKey(monthStart)}T00:00:00.000Z`).getTime();
          const endTime = new Date(`${dateKey(monthEnd)}T23:59:59.999Z`).getTime();
          const fallback = eligibleUsers.map((user) => {
            const converted = leadsData.filter((lead) => {
              if (lead.assigned !== user.name || !convertedStatuses.includes(lead.status)) return false;
              const conversionTime = new Date(lead.convertedAt || lead.updatedAt).getTime();
              return conversionTime >= startTime && conversionTime <= endTime;
            });
            return {
              ...user,
              sales: converted.reduce((total, lead) => total + (Number(lead.saleAmount) || 0), 0),
              conversions: converted.length,
            };
          });
          setLeaderboardPeople(fallback);
        } else if (Array.isArray(leaderboardData)) {
          setLeaderboardPeople(leaderboardData);
        }
        setLeaderboardLoadError(!Array.isArray(leaderboardData) && !(Array.isArray(usersData) && Array.isArray(leadsData)));
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
  useEffect(() => {
    if (!authUser || !["leads", "my-leads"].includes(page) || dataLoading) return;
    let cancelled = false;
    setLeadsRefreshing(true);
    api.getLeads().then((items) => {
      if (cancelled) return;
      if (Array.isArray(items)) {
        setLeads(items.map(normalizeLead));
        setLeadsError(false);
      } else {
        setLeadsError(true);
      }
    }).finally(() => { if (!cancelled) setLeadsRefreshing(false); });
    return () => { cancelled = true; };
  }, [authUser, page, dataLoading, leadsReload]);
  useEffect(() => {
    if (!authUser) { setUserNotifications([]); return; }
    let cancelled = false;
    const refreshNotifications = async () => {
      const items = await api.getNotifications();
      if (!cancelled && Array.isArray(items)) setUserNotifications(items);
    };
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [authUser]);
  useEffect(() => {
    if (!authUser || page !== "follow-ups" || dataLoading) return;
    let cancelled = false;
    api.getFollowups().then((items) => {
      if (!cancelled && Array.isArray(items)) {
        setFollowups(items.map(normalizeFollowup));
      }
    });
    return () => { cancelled = true; };
  }, [authUser, page, dataLoading]);

  const scopedNames = role === "Sales Executive" ? [authUser?.name] : null;
  const userName = authUser?.name || "User";
  const readOnly = role === "Super Admin";
  const canManageAccounts = ["Super Admin", "Data Analytics Manager"].includes(role);
  const canCreateLead = ["Data Analytics Manager", "Team Lead", "Sales Executive"].includes(role);
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
  const reportRows = page === "sales-reports"
    ? scopedLeads.filter((lead) => convertedStatuses.includes(lead.status))
    : page === "lead-reports" ? scopedLeads
      : page === "call-reports" ? callsState.filter((call) => !scopedNames || scopedNames.includes(call.assigned))
        : page === "follow-up-reports" ? scopedFollowups : [];
  const allowed =
    access[role].includes(page) ||
    (page === "leads" && detailId && role === "Sales Executive");
  const refreshLeaderboard = async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const updated = await api.getLeaderboard({ startDate: dateKey(monthStart), endDate: dateKey(monthEnd) });
    if (Array.isArray(updated)) {
      setLeaderboardPeople(updated);
      setLeaderboardLoadError(false);
    } else {
      setLeaderboardLoadError(true);
    }
  };
  const updateLead = async (lead, { silent = false } = {}) => {
    if (!canEditLead(lead)) { notify("You can only update your assigned leads.", "error"); return false; }
    const saved = await api.updateLead(lead.id, lead);
    if (!saved) { notify("Could not save lead. Please try again.", "error"); return false; }
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? normalizeLead(saved) : l)));
    await refreshLeaderboard();
    if (!silent) notify("Lead updated");
    return true;
  };
  const deleteLead = async (lead) => {
    if (!canDeleteLead || !lead) return;
    const deleted = await api.deleteLead(lead.id);
    if (!deleted) { notify("Could not delete lead. Please try again.", "error"); return; }
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setFollowups((prev) => prev.filter((item) => String(item.leadId) !== String(lead.customId ?? lead.id)));
    await refreshLeaderboard();
    setModal(null);
    if (detailId === lead.id) navigate("leads");
    notify("Lead deleted");
  };
  const refreshLeadSchedule = async (leadId) => {
    const updated = await api.getLead(leadId);
    if (updated) {
      setLeads((prev) => prev.map((lead) => String(lead.id) === String(leadId) ? normalizeLead(updated) : lead));
    }
  };
  const completeFollowup = async (followup) => {
    if (readOnly || !canWorkRecord(followup)) return;
    const saved = await api.toggleFollowup(followup._id || followup.id);
    if (!saved) { notify("Could not complete follow-up. Please try again.", "error"); return; }
    setFollowups((prev) => prev.map((item) => item._id === saved._id ? normalizeFollowup(saved) : item));
    await refreshLeadSchedule(saved.leadId);
    notify(saved.completed ? "Follow-up completed" : "Follow-up reopened");
  };
  const deleteFollowup = async (followup) => {
    if (readOnly || !canWorkRecord(followup)) return;
    const deleted = await api.deleteFollowup(followup._id || followup.id);
    if (!deleted) { notify("Could not delete follow-up. Please try again.", "error"); return; }
    setFollowups((prev) => prev.filter((item) => item._id !== followup._id));
    await refreshLeadSchedule(followup.leadId);
    setModal(null);
    notify("Follow-up deleted");
  };
  const changeUserStatus = async (account) => {
    if (!canManageAccounts) return;
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
      await refreshLeaderboard();
      notify(`${account.name} ${saved.status === "Active" ? "activated" : "deactivated"}`);
    } catch (error) {
      notify(error.message, "error");
    }
  };
  const updateLeaderboardAccount = async (account, changes) => {
    if (!canManageAccounts) return null;
    try {
      const saved = await api.updateUser(account.id, changes);
      const normalized = { ...saved, id: saved.id || saved.customId || saved._id };
      setUsers((previous) => previous.map((user) => user.id === account.id ? normalized : user));
      setPeople((previous) => previous.map((person) => person.id === account.id ? normalized : person));
      await refreshLeaderboard();
      notify(changes.leaderboardVisible === false ? "Removed from leaderboard" : changes.leaderboardVisible === true ? "Restored to leaderboard" : "Target updated");
      return normalized;
    } catch (error) {
      notify(error.message || "Could not update leaderboard", "error");
      return null;
    }
  };
  async function exportData(rows, name, format = "csv") {
    try {
      await downloadExport(rows, name, format);
      notify(`${format === "xlsx" ? "Excel" : format.toUpperCase()} export is ready`);
    } catch (error) {
      notify(error.message || "Could not export records", "error");
    }
  }
  async function saveForm(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const todayStr = new Date().toISOString().split("T")[0];
    if (modal.type === "call") {
      const callData = {
        name: data.name?.trim() || "Unknown",
        phone: data.phone?.trim() || "",
        direction: data.direction || "Outgoing",
        callStatus: data.callStatus || "Answered",
        duration: data.duration?.trim() || "01:30",
        service: data.service || "",
        assigned: ["Team Lead", "Sales Executive"].includes(role) ? userName : (data.assigned || userName),
        callDate: data.callDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        callTime: data.callTime || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        notes: data.notes?.trim() || "",
        leadId: modal.record?.customId || modal.record?.id || (data.leadId && data.leadId !== "custom" ? Number(data.leadId) : undefined),
      };

      const saved = await api.createCall(callData);
      if (!saved) {
        notify("Could not log call. Please try again.", "error");
        return;
      }
      setCallsState((prev) => [saved, ...prev]);

      if (data.createAsLead === "on" || data.createAsLead === "true") {
        const selectedCourse = courses.find((course) => course.name === data.service) || courses[0];
        const newLead = {
          name: callData.name,
          phone: callData.phone,
          service: selectedCourse.name,
          source: "Direct",
          status: "Contacted",
          priority: "Warm",
          assigned: callData.assigned,
          saleAmount: selectedCourse.fee,
          advanceAmount: 0,
          created: todayStr,
          notes: callData.notes ? [{ text: callData.notes, author: userName }] : [],
          activities: [
            { text: `Lead created from Call Log (${callData.callStatus})`, time: "Just now" },
          ],
        };
        const createdLead = await api.createLead(newLead);
        if (createdLead) {
          setLeads((prev) => [normalizeLead(createdLead), ...prev]);
        }
      }

      notify("Call logged successfully");
      setModal(null);
      return;
    }
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
      if (["Team Lead", "Sales Executive"].includes(role)) data.assigned = userName;
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
        status: role === "Data Analytics Manager" && !modal.record ? "" : data.status,
        priority: role === "Data Analytics Manager" && !modal.record ? "" : data.priority,
        saleAmount,
        advanceAmount,
        id: modal.record?.id || Date.now(),
        created: modal.record?.created || todayStr,
        date: role === "Data Analytics Manager" && !modal.record ? "" : (data.date ?? modal.record?.date ?? todayStr),
        time: role === "Data Analytics Manager" && !modal.record ? "" : (data.time ?? modal.record?.time ?? "10:30"),
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
      const updatedFollowups = await api.getFollowups();
      if (Array.isArray(updatedFollowups)) {
        setFollowups(updatedFollowups.map(normalizeFollowup));
      }
      await refreshLeaderboard();
      notify(modal.record ? "Lead updated" : "Lead added successfully");
    }
    if (modal.type === "followup") {
      const lead = leads.find((l) => String(l.id) === String(data.leadId)) || {};
      if (!lead.id || !canWorkRecord(lead) || (modal.record && !canWorkRecord(modal.record))) {
        notify("You can only schedule follow-ups for your assigned leads.", "error");
        return;
      }
      const f = {
        leadId: Number(lead.customId ?? lead.id),
        name: lead.name,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        location: lead.location,
        service: lead.service,
        source: lead.source,
        assigned: lead.assigned,
        priority: lead.priority,
        date: data.date,
        time: data.time,
        type: data.type,
        notes: data.notes,
        purpose: data.notes?.trim() || modal.record?.purpose || "Follow up with customer",
      };
      if (modal.record) {
        const saved = await api.updateFollowup(modal.record._id || modal.record.id, f);
        if (!saved) { notify("Could not save follow-up. Please try again.", "error"); return; }
        setFollowups((prev) => prev.map((item) => item._id === saved._id ? normalizeFollowup(saved) : item));
      } else {
        const saved = await api.createFollowup(f);
        if (!saved) { notify("Could not add follow-up. Please try again.", "error"); return; }
        setFollowups((prev) => [normalizeFollowup(saved), ...prev]);
      }
      await refreshLeadSchedule(lead.id);
      notify(modal.record ? "Follow-up updated" : "Follow-up added");
    }
    if (modal.type === "user") {
      if (!canManageAccounts) { notify("You do not have permission to manage accounts.", "error"); return; }
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
        const account = { ...saved, id: saved.id || saved.customId || saved._id };
        const nextUsers = modal.record
          ? users.map((x) => (x.id === u.id ? account : x))
          : [account, ...users];
        setUsers(nextUsers);
        setPeople(nextUsers.filter((account) => ["Sales Executive", "Team Lead"].includes(account.role) && account.status === "Active"));
        await refreshLeaderboard();
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
          className="brand mobile-brand"
          href="/"
          aria-label="ENTRAIN Academy CRM"
          onClick={(e) => {
            e.preventDefault();
            navigate("dashboard");
          }}
        >
          <img className="brand-full" src="/images/entrain-logo.png" alt="ENTRAIN Academy" />
        </a>
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
          <button
            ref={notificationButtonRef}
            className="notification-button icon-button"
            aria-label="Notifications"
            aria-expanded={dropdown === "notifications"}
            onClick={async () => {
              const opening = dropdown !== "notifications";
              setDropdown(opening ? "notifications" : "");
              if (opening) {
                const items = await api.getNotifications();
                if (Array.isArray(items)) setUserNotifications(items);
              }
            }}
          >
            <Bell size={18} />
            {userNotifications.some((item) => !item.readAt) && <i />}
          </button>
        </div>
        {dropdown === "notifications" && (
          <div className="nav-dropdown notifications" ref={notificationPanelRef}>
            <div className="dropdown-title">
              Notifications
              {userNotifications.some((item) => !item.readAt) && (
                <button className="text-button" onClick={markAllRead}>Mark all read</button>
              )}
            </div>
            {userNotifications.length === 0 && <p className="notifications-empty">No notifications yet</p>}
            {userNotifications.map((item) => (
              <button
                key={item._id}
                onClick={() => openNotification(item)}
              >
                <span className={`notification-dot ${item.readAt ? "read" : ""}`} />
                <span>
                  {item.message}
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </header>
      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
      )}
      <aside className={`sidebar ${drawer ? "drawer-open" : ""}`}>
        <div className="sidebar-top">
          <a
            className="brand sidebar-brand"
            href="/"
            aria-label="ENTRAIN Academy CRM"
            onClick={(event) => {
              event.preventDefault();
              navigate("dashboard");
            }}
          >
            <img className="brand-full" src="/images/entrain-logo.png" alt="ENTRAIN Academy" />
          </a>
          <button
            className="sidebar-collapse"
            type="button"
            aria-label={drawer ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={drawer ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              if (window.matchMedia("(max-width: 760px)").matches) setDrawer(false);
              else setCollapsed(!collapsed);
            }}
          >
            {collapsed && !drawer ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
        </div>
        <nav>
          {navGroups.map(([heading, items]) => {
            const visible = items.filter((x) => access[role].includes(x[0]));
            if (!visible.length) return null;
            return (
              <div className="nav-group" key={heading}>
                {heading === "REPORTS" ? (
                  <button
                    type="button"
                    className="nav-group-toggle"
                    aria-label="Reports"
                    aria-expanded={reportsOpen}
                    onClick={() => setReportsOpen((open) => !open)}
                  >
                    <FileChartColumn size={17} />
                    <span>REPORTS</span>
                    <ChevronDown size={14} className={reportsOpen ? "is-open" : ""} />
                  </button>
                ) : heading && <div className="nav-group-label">{heading}</div>}
                {(heading !== "REPORTS" || reportsOpen) && visible.map(([id, label, Icon]) => (
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
                    <span>{label}</span>
                    {id === "leaderboard" && <i className="nav-new" />}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button
            ref={accountButtonRef}
            className="profile-button sidebar-profile-button"
            aria-expanded={dropdown === "profile"}
            onClick={() => setDropdown(dropdown === "profile" ? "" : "profile")}
          >
            <UserAvatar name={userName} />
            <span><strong>{userName}</strong><small>{role}</small></span>
            <ChevronDown size={13} />
          </button>
          {dropdown === "profile" && (
            <div className="nav-dropdown profile-dropdown sidebar-profile-dropdown" ref={accountPanelRef}>
              <strong>{userName}</strong>
              <small>{authUser.email}</small>
              <button onClick={() => { setModal({ type: "profile" }); setDropdown(""); }}>
                <UserRound size={15} /> My Profile
              </button>
              {canManageAccounts && <button onClick={() => navigate("settings")}><Settings size={15} /> Settings</button>}
              <button onClick={() => { setModal({ type: "logout" }); setDropdown(""); }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
          {/* <div className="sidebar-version">
            <span className="live-dot" />  <small>v1.0</small>
          </div> */}
        </div>
      </aside>
      <main
        className={`main${page === "dashboard" ? " dashboard-page" : ""}${["follow-ups", "calls", "customers", "staff", "users"].includes(page) ? " table-page" : ""}`}
      >
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
                    ? `${getGreeting()}, ${userName.split(" ")[0]}`
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
                  canCreateLead && (
                      <button
                        className="primary"
                        disabled={dataLoading}
                        onClick={() => setModal({ type: "lead" })}
                      >
                        <Plus size={16} /> Add lead
                      </button>
                  )
                ) : ["leads", "my-leads", "pipeline"].includes(page) && canCreateLead ? (
                  <button
                    className="primary"
                    disabled={dataLoading}
                    onClick={() => setModal({ type: "lead" })}
                  >
                    <Plus size={16} /> Add lead
                  </button>
                ) : page === "calls" && !readOnly ? (
                  <button
                    className="primary"
                    disabled={dataLoading}
                    onClick={() => setModal({ type: "call" })}
                  >
                    <Plus size={16} /> Log call
                  </button>
                ) : page === "follow-ups" && !readOnly ? (
                  <button
                    className="primary"
                    onClick={() => setModal({ type: "followup" })}
                  >
                    <Plus size={16} /> Add follow-up
                  </button>
                ) : page === "users" && canManageAccounts ? (
                  <button
                    className="primary"
                    disabled={dataLoading}
                    onClick={() => setModal({ type: "user" })}
                  >
                    <Plus size={16} /> Add user
                  </button>
                ) : page.includes("reports") ? (
                  <ExportMenu label="Export report" onExport={(format) => exportData(reportRows, page, format)} />
                ) : null}
              </PageHeader>
            )}
            {(dataLoading || (leadsRefreshing && scopedLeads.length === 0 && ["leads", "my-leads"].includes(page))) && !["settings", "users"].includes(page) ? (
              <WorkspaceSkeleton page={page} />
            ) : (
              <>
            {(page === "dashboard" || page.includes("reports")) && (
              <div
                className={`period-row ${page === "dashboard" ? "dashboard-period-row" : ""}`}
              >
                <DateRangeFilter value={period} onChange={setPeriod} />
              </div>
            )}
            {page === "dashboard" && (
              <Dashboard
                role={role}
                leads={scopedLeads}
                people={leaderboardPeople}
                leaderboardLoadError={leaderboardLoadError}
                salespeopleCount={people.length}
                onAddSalesperson={canManageAccounts ? () => setModal({ type: "user", context: "leaderboard" }) : null}
                viewerName={userName}
                ownAccount={authUser}
                staff={users}
                followups={scopedFollowups}
                calls={callsState}
                navigate={navigate}
                period={period}
              />
            )}
            {["leads", "my-leads"].includes(page) && leadsError && scopedLeads.length === 0 ? (
              <section className="card detail-card" role="alert">
                <h2>Could not load leads</h2>
                <p>Please try loading this page again.</p>
                <button onClick={() => setLeadsReload((count) => count + 1)}>Retry</button>
              </section>
            ) : ["leads", "my-leads"].includes(page) &&
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
                onComplete={completeFollowup}
                onDelete={(followup) => setModal({ type: "delete-followup", record: followup })}
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
              <CallsPage
                calls={callsState}
                leads={scopedLeads}
                allowedNames={scopedNames}
                notify={notify}
                openModal={setModal}
                navigate={navigate}
                readOnly={readOnly}
                canWorkRecord={canWorkRecord}
              />
            )}
            {page === "customers" && (
              <CustomersPage leads={scopedLeads} navigate={navigate} />
            )}
            {page === "leaderboard" && (
              <LeaderboardPage
                accounts={people}
                canManage={canManageAccounts}
                onAddPerson={() => setModal({ type: "user", context: "leaderboard" })}
                onUpdateAccount={updateLeaderboardAccount}
              />
            )}
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
                canManage={canManageAccounts}
              />
            )}
            {page === "settings" && <SettingsPage notify={notify} />}
            {page === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} />}
              </>
            )}
          </>
        )}
      </main>
      {modal && !["logout", "delete-lead", "delete-followup"].includes(modal.type) && (
        <Modal
          title={
            modal.type === "call"
              ? modal.record
                ? `Log call: ${modal.record.name || modal.record.phone}`
                : "Log call"
              : modal.type === "lead"
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
          {["lead", "assignment", "followup", "user", "call"].includes(modal.type) ? (
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
                    {(role !== "Data Analytics Manager" || modal.record) && (
                      <label>
                        Priority
                        <select name="priority" defaultValue={modal.record?.priority ?? "Cool"}>
                          <option value="">No priority</option>
                          {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                          {modal.record?.priority && !priorities.includes(modal.record.priority) && (
                            <option value={modal.record.priority}>{modal.record.priority}</option>
                          )}
                        </select>
                      </label>
                    )}
                    {!["Team Lead", "Sales Executive"].includes(role) && (
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
                    {(role !== "Data Analytics Manager" || modal.record) && (
                      <label>
                        Status
                        <select name="status" defaultValue={modal.record?.status ?? ""}>
                          <option value="">No status</option>
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          {modal.record?.status && !statuses.includes(modal.record.status) && (
                            <option value={modal.record.status}>{modal.record.status}</option>
                          )}
                        </select>
                      </label>
                    )}
                    {(role !== "Data Analytics Manager" || modal.record) && (
                      <>
                        <label>
                          Next follow-up
                          <input name="date" type="date" defaultValue={modal.record?.date ?? todayStr} />
                        </label>
                        <label>
                          Follow-up time
                          <input name="time" type="time" defaultValue={modal.record?.time ?? "10:30"} />
                        </label>
                      </>
                    )}
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
                {modal.type === "call" && (
                  <CallModalFields
                    modal={modal}
                    scopedLeads={scopedLeads}
                    people={people}
                    assignmentNames={assignmentNames}
                    role={role}
                    userName={userName}
                    courses={courses}
                    todayStr={todayStr}
                  />
                )}
                {modal.type === "user" && (
                  <>
                    {field("Name", "name")}
                    {field("Email", "email", "email")}
                    <label>{modal.record ? "New password (optional)" : "Temporary password"}<input name="password" type="password" minLength="8" required={!modal.record} autoComplete="new-password" /></label>
                    {field("Phone", "phone", "tel")}
                    {field("Role", "role", "text", modal.context === "leaderboard" ? ["Sales Executive", "Team Lead"] : modal.record?.role && !roles.includes(modal.record.role) ? [...roles, modal.record.role] : roles)}
                    {modal.context === "leaderboard" && (
                      <label>
                        Monthly target (₹)
                        <input name="target" type="number" min="1" step="1" defaultValue="500000" required />
                      </label>
                    )}
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
                    : modal.type === "call"
                    ? "Save call log"
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
            setLeaderboardPeople([]);
            setLeaderboardLoadError(false);
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
      {modal?.type === "delete-followup" && (
        <ConfirmDialog
          title={`Delete follow-up for ${modal.record?.name}?`}
          message="This follow-up will be permanently removed."
          confirmLabel="Delete follow-up"
          destructive
          onClose={() => setModal(null)}
          onConfirm={() => deleteFollowup(modal.record)}
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
