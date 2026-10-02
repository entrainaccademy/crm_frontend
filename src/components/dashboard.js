"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  UserPlus,
  CalendarClock,
  Clock,
  Phone,
  CheckCircle2,
  TrendingUp,
  Target,
  Trophy,
} from "lucide-react";
import {
  StatCard,
  UserAvatar,
  ProgressBar,
  StatusBadge,
  DataTable,
} from "./ui";
import { money, shortMoney, rankExecutives, statuses, convertedStatuses, closedStatuses } from "@/lib/data";

export function SalesChart({ period = "This Month", salesTotal, targetTotal, leads = [] }) {
  const days = ["1", "5", "10", "15", "20", "25", "28", "30"];
  const currentMonth = new Date().toLocaleString("default", { month: "short" });
  
  const wonLeads = leads.filter((l) => convertedStatuses.includes(l.status));
  const totalSalesVal = salesTotal ?? wonLeads.reduce((s, l) => s + (Number(l.saleAmount) || 0), 0);
  const totalTargetVal = targetTotal ?? 3600000;

  const dynamicChartData = days.map((day, i) => {
    const progress = (i + 1) / days.length;
    return {
      day: `${day} ${currentMonth}`,
      sales: Number(((totalSalesVal * progress) / 100000).toFixed(1)),
      target: Number(((totalTargetVal * progress) / 100000).toFixed(1)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={225}>
      <AreaChart
        data={dynamicChartData}
        margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 4"
          vertical={false}
          stroke="#e8edf3"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#78879a" }}
          minTickGap={20}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#78879a" }}
          tickFormatter={(v) => `₹${v}L`}
        />
        <Tooltip
          formatter={(v) => `₹${v}L`}
          contentStyle={{
            borderRadius: 8,
            fontSize: 13,
            borderColor: "#dbe4ee",
          }}
        />
        <Area
          type="monotone"
          dataKey="target"
          stroke="#c29a58"
          strokeDasharray="5 5"
          fill="transparent"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#315d8c"
          fill="#eaf1f8"
          strokeWidth={2.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TargetCard({ person }) {
  if (!person) return null;
  const sales = person.sales || 0;
  const target = person.target || 500000;
  const pct = Math.round((sales / Math.max(1, target)) * 100);
  const currentMonthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <section className="card target-card">
      <div className="section-heading">
        <h2>
          <Target size={16} /> My monthly target
        </h2>
        <span className="muted">{currentMonthName}</span>
      </div>
      <div className="target-total">
        {shortMoney(sales)} <span>/ {shortMoney(target)}</span>
        <b>{pct}%</b>
      </div>
      <ProgressBar value={pct} />
      <div className="target-caption">
        <span>
          {pct >= 100
            ? "Target achieved"
            : `${shortMoney(Math.max(0, target - sales))} remaining`}
        </span>
        <span>
          Target Status: <strong>{pct >= 100 ? "Completed" : "In Progress"}</strong>
        </span>
      </div>
      <div className="target-note">
        <TrendingUp size={16} />
        {pct >= 100
          ? `${money(sales - target)} above target`
          : "Keep logging interactions to reach your monthly goal."}
      </div>
    </section>
  );
}

export function LeaderboardRow({ person, index }) {
  const sales = person.sales || 0;
  const target = person.target || 1;
  const pct = Math.round((sales / Math.max(1, target)) * 100);
  return (
    <div className="leaderboard-row">
      <span className={`rank ${index < 3 ? "top-rank" : ""}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <UserAvatar name={person.name} index={index} />
      <div className="leader-person">
        <strong>{person.short || person.name}</strong>
        <small>
          {shortMoney(sales)} <span>/ {shortMoney(target)}</span>
        </small>
      </div>
      <div className="leader-progress">
        <strong>
          {pct}% {pct >= 100 && <CheckCircle2 size={12} />}
        </strong>
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

export function Leaderboard({ people = [], navigate }) {
  const ranked = rankExecutives(people);
  return (
    <section className="card leaderboard-card">
      <div className="section-heading">
        <h2>
          <Trophy size={17} /> Sales leaderboard
        </h2>
        <span className="tiny-tag">THIS MONTH</span>
      </div>
      <p className="section-subtitle">
        Performance and goal tracking for salespeople.
      </p>
      {ranked.length === 0 ? (
        <div className="empty-inline">No executive records found.</div>
      ) : (
        ranked.slice(0, 5).map((p, i) => (
          <LeaderboardRow key={p.id || i} person={p} index={i} />
        ))
      )}
      <button className="card-link" onClick={() => navigate("leaderboard")}>
        View full leaderboard <ArrowRight size={14} />
      </button>
    </section>
  );
}

export default function Dashboard({
  role,
  leads = [],
  people = [],
  staff = [],
  followups = [],
  calls = [],
  navigate,
  openModal,
  period = "This Month",
  readOnly = false,
  canWorkRecord = () => true,
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const totalLeads = leads.length;
  const leadsAddedToday = leads.filter((lead) => lead.created === todayStr).length;
  const followupsToday = followups.filter((f) => !f.completed && f.date === todayStr).length;
  const overdueFollowups = followups.filter((f) => !f.completed && f.date < todayStr).length;
  const callsToday = calls.filter((c) => c.callDate === todayStr || c.callDate === "Today").length || calls.length;
  const wonLeads = leads.filter((l) => convertedStatuses.includes(l.status));
  const convertedLeads = wonLeads.length;

  const totalAchievedSales = wonLeads.reduce((sum, l) => sum + (Number(l.saleAmount) || 0), 0);
  const totalTargetSales = people.reduce((sum, p) => sum + (Number(p.target) || 0), 0) || 3600000;
  const overallAchievement = Math.round((totalAchievedSales / Math.max(1, totalTargetSales)) * 100);

  const stats = [
    ["Total leads", totalLeads, totalLeads > 0 ? `${totalLeads} active` : "No leads", Users],
    ["Added today", leadsAddedToday, leadsAddedToday > 0 ? `${leadsAddedToday} added` : "None added", UserPlus],
    ["Follow-ups today", followupsToday, followupsToday > 0 ? "Due today" : "None due", CalendarClock],
    ["Overdue follow-ups", overdueFollowups, overdueFollowups > 0 ? "Action needed" : "Up to date", Clock],
    ["Calls logged", callsToday, `${calls.length} total`, Phone],
    ["Converted leads", convertedLeads, totalLeads > 0 ? `${Math.round((convertedLeads / totalLeads) * 100)}% conv.` : "0%", CheckCircle2],
  ];

  if (role === "HR") {
    return (
      <>
        <div className="stats-grid four">
          {[
            ["Staff members", staff.length],
            ["Active employees", staff.filter((person) => person.status === "Active").length],
            ["Open tasks", 0],
            ["Salespeople", people.length],
          ].map(([label, value]) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              icon={Users}
              change="Active staff"
              showComparison={false}
            />
          ))}
        </div>
        <div className="dashboard-main">
          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Your people, at a glance</h2>
                <p className="section-subtitle">
                  Employee information and sales performance.
                </p>
              </div>
              <button onClick={() => navigate("staff")}>
                View staff <ArrowRight size={14} />
              </button>
            </div>
            <DataTable
              rows={staff.slice(0, 6)}
              columns={[
                {
                  key: "name",
                  label: "Employee",
                  render: (r) => (
                    <div className="person-cell">
                      <UserAvatar name={r.name} />
                      <strong>{r.name}</strong>
                    </div>
                  ),
                },
                { key: "role", label: "Role" },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => <StatusBadge status={r.status || "Active"} />,
                },
              ]}
            />
            <button className="card-link" onClick={() => navigate("tasks")}>
              Review employee tasks <ArrowRight size={14} />
            </button>
          </section>
          <Leaderboard people={people} navigate={navigate} />
        </div>
      </>
    );
  }

  const activePipelineLeads = leads.filter((l) => !closedStatuses.includes(l.status));
  const activePipelineValue = activePipelineLeads.reduce((sum, l) => sum + (Number(l.saleAmount) || 0), 0);

  const stageColors = { New: "#315d8c", Contacted: "#6085ab", "Follow-up": "#c29a58", Qualified: "#438a91" };
  const activeStatuses = [...new Set([
    ...(activePipelineLeads.some((lead) => !lead.status) ? [""] : []),
    ...statuses.filter((status) => !closedStatuses.includes(status)),
    ...activePipelineLeads.map((lead) => lead.status).filter(Boolean),
  ])];
  const stageCounts = activeStatuses.map((status) => {
    const st = { name: status || "No status", status, color: stageColors[status] || "#8fad9f" };
    const matches = leads.filter((l) => (l.status || "") === st.status);
    const sum = matches.reduce((acc, l) => acc + (Number(l.saleAmount) || 0), 0);
    return {
      name: st.name,
      count: matches.length,
      amount: money(sum),
      color: st.color,
    };
  });

  const todayFollowupRows = followups
    .filter((x) => !x.completed && (x.date === todayStr || !x.date))
    .slice(0, 3);

  const activeSalesExec = people.find((x) => x.role === "Sales Executive") || people[0];

  return (
    <>
      <div className="overview-label">
        <span>BUSINESS OVERVIEW</span>
        <span className="live-dot" /> Live overview{" "}
        <small>Real-time database sync</small>
      </div>
      <div className="stats-grid dashboard-stats">
        {stats.map(([label, value, change, icon], i) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            change={change}
            icon={icon}
            negative={i === 3 && value > 0}
          />
        ))}
      </div>
      {role === "Sales Executive" && activeSalesExec && (
        <TargetCard person={activeSalesExec} />
      )}
      <div className="dashboard-main">
        <section className="card sales-card">
          <div className="section-heading">
            <div>
              <h2>Sales overview</h2>
              <p className="section-subtitle">
                Revenue performance from converted opportunities
              </p>
            </div>
            <select aria-label="Sales overview metric">
              <option>Revenue</option>
              <option>Sales achieved</option>
            </select>
          </div>
          <div className="revenue-line">
            <strong>{money(totalAchievedSales)}</strong>
            <span className="positive">
              <ArrowUpRight size={13} />
              {overallAchievement}%
            </span>
            <small>of target</small>
            <div className="chart-legend">
              <span>
                <i />
                Achieved
              </span>
              <span>
                <i />
                Target
              </span>
            </div>
          </div>
          <SalesChart period={period} leads={leads} salesTotal={totalAchievedSales} targetTotal={totalTargetSales} />
          <div className="chart-footer">
            <span>
              Target <strong>{money(totalTargetSales)}</strong>
            </span>
            <span>
              <span className="positive">{overallAchievement}%</span> of target achieved
            </span>
          </div>
        </section>
        <Leaderboard people={people} navigate={navigate} />
      </div>
      <div className="dashboard-bottom">
        <section className="card followup-card">
          <div className="section-heading">
            <div>
              <h2>
                Today’s follow-ups{" "}
                <span className="count-pill">
                  {todayFollowupRows.length}
                </span>
              </h2>
              <p className="section-subtitle">
                Follow-ups scheduled for today.
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => navigate("follow-ups")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <DataTable
            columns={[
              {
                key: "name",
                label: "CUSTOMER",
                render: (r) => (
                  <div className="person-cell">
                    <UserAvatar name={r.name} />
                    <div>
                      <strong>{r.name}</strong>
                      <small>{r.service}</small>
                    </div>
                  </div>
                ),
              },
              {
                key: "time",
                label: "SCHEDULE",
                render: (r) => (
                  <div>
                    <strong>{r.time || "10:30"}</strong>
                    <small>Today</small>
                  </div>
                ),
              },
              { key: "purpose", label: "PURPOSE" },
              !readOnly && {
                key: "action",
                label: "",
                render: (r) => canWorkRecord(r) ? (
                  <button
                    className="small-button"
                    onClick={() => openModal({ type: "followup", record: r })}
                  >
                    <Phone size={13} /> Follow up
                  </button>
                ) : null,
              },
            ].filter(Boolean)}
            rows={todayFollowupRows}
          />
        </section>
        <section className="card pipeline-summary">
          <div className="section-heading">
            <h2>Pipeline snapshot</h2>
            <button
              className="icon-button"
              aria-label="Open pipeline"
              onClick={() => navigate("pipeline")}
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="pipeline-total">
            <strong>{money(activePipelineValue)}</strong>
            <span>across {activePipelineLeads.length} active opportunities</span>
          </div>
          <div className="stacked-bar">
            {activePipelineLeads.length > 0 ? (
              stageCounts.map((st, i) => {
                const pct = Math.round((st.count / activePipelineLeads.length) * 100) || 0;
                return (
                  <span
                    key={i}
                    style={{
                      width: `${pct}%`,
                      background: st.color,
                    }}
                  />
                );
              })
            ) : (
              <span style={{ width: "100%", background: "#e2e8f0" }} />
            )}
          </div>
          {stageCounts.map((st) => (
            <div className="pipeline-line" key={st.name}>
              <i style={{ background: st.color }} />
              <span>{st.name}</span>
              <small>{st.count}</small>
              <strong>{st.amount}</strong>
            </div>
          ))}
        </section>
      </div>
      <div className="workspace-footer">
        <span>
          <span className="live-dot" /> All systems operational
        </span>
        <span>ENTRAIN CRM · Your growth, in focus.</span>
      </div>
    </>
  );
}
