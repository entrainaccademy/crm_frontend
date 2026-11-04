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
  ShoppingBag,
} from "lucide-react";
import {
  StatCard,
  UserAvatar,
  ProgressBar,
  StatusBadge,
  DataTable,
} from "./ui";
import { money, shortMoney, rankExecutives, convertedStatuses, saleDate } from "@/lib/data";
import EmptyState from "./empty-state";

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const recordDate = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    if (value.length === 10) return value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateKey(date);
};
const callDateKey = (call) => {
  const raw = call.callDate || call.startedAt || call.createdAt;
  if (raw === "Today") return dateKey(new Date());
  return recordDate(raw);
};
const periodRange = (period, now, customStart, customEnd) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "This Week") start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  if (period === "This Month") start.setDate(1);
  if (period === "Last Month") {
    return {
      start: dateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end: dateKey(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  if (period === "Custom") return { start: customStart, end: customEnd };
  return { start: dateKey(start), end: dateKey(now) };
};
const inRange = (date, range) => Boolean(date && date >= range.start && date <= range.end);

export function SalesChart({ period = "This Month", range = periodRange(period === "Custom" ? "This Month" : period, new Date()), targetTotal, leads = [] }) {
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  const dailySales = new Map();
  leads.filter((lead) => convertedStatuses.includes(lead.status)).forEach((lead) => {
    const day = recordDate(saleDate(lead));
    if (inRange(day, range)) dailySales.set(day, (dailySales.get(day) || 0) + (Number(lead.saleAmount) || 0));
  });
  const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
  let runningSales = 0;
  const dynamicChartData = Array.from({ length: totalDays }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    runningSales += dailySales.get(dateKey(day)) || 0;
    return {
      day: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      sales: runningSales / 100000,
      target: ((targetTotal || 0) * (index + 1) / totalDays) / 100000,
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

export function Leaderboard({ people = [], navigate, loadError = false, salespeopleCount = 0, onAddSalesperson }) {
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
      {loadError ? (
        <div className="leaderboard-message" role="alert">Could not load the sales leaderboard. Refresh the page to try again.</div>
      ) : ranked.length === 0 ? (
        <EmptyState
          compact
          kind="team"
          title={salespeopleCount > 0 ? "No one on the leaderboard yet" : "No salespeople added yet"}
          description={salespeopleCount > 0
            ? "Add an active salesperson to the leaderboard to see their progress here."
            : "Add a Team Lead or Sales Executive to start tracking sales performance."}
          action={salespeopleCount === 0 ? "Add salesperson" : null}
          onAction={onAddSalesperson}
        />
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
  viewerName,
  ownAccount,
  leads = [],
  people = [],
  leaderboardLoadError = false,
  salespeopleCount = 0,
  onAddSalesperson,
  staff = [],
  followups = [],
  calls = [],
  allowedNames,
  navigate,
  period = "This Month",
  customStart = "",
  customEnd = "",
}) {
  const today = new Date();
  const todayStr = dateKey(today);
  const range = periodRange(period, today, customStart, customEnd);
  if (period === "Custom" && (!customStart || !customEnd || customStart > customEnd)) {
    return <section className="card" style={{ padding: 24 }} role="status">{customStart && customEnd ? "Start date must be on or before end date." : "Choose a start and end date to see dashboard results."}</section>;
  }
  const periodLabel = period === "Today" ? "today" : period === "This Week" ? "this week" : period === "This Month" ? "this month" : period === "Last Month" ? "last month" : "in the selected dates";
  const periodCalls = calls.filter((call) =>
    (!allowedNames || allowedNames.includes(call.assigned)) && inRange(callDateKey(call), range)
  );

  const totalLeads = leads.filter((lead) => !recordDate(lead.createdAt || lead.created) || recordDate(lead.createdAt || lead.created) <= range.end).length;
  const leadsAddedToday = leads.filter((lead) => inRange(recordDate(lead.createdAt || lead.created), range)).length;
  const followupsToday = followups.filter((f) => !f.completed && inRange(recordDate(f.date), range)).length;
  const overdueFollowups = followups.filter((f) => !f.completed && recordDate(f.date) && recordDate(f.date) < range.start).length;
  const callsToday = periodCalls.length;
  const wonLeads = leads.filter((l) => convertedStatuses.includes(l.status) && inRange(recordDate(l.convertedAt || l.updatedAt), range));
  const periodSales = leads.filter((lead) => lead.status === "Sale" && inRange(recordDate(saleDate(lead)), range));
  const convertedLeads = wonLeads.length;
  const salesLeads = periodSales.length;

  const totalAchievedSales = periodSales.reduce((sum, l) => sum + (Number(l.saleAmount) || 0), 0);
  const monthlyTargetSales = people.reduce((sum, p) => sum + (Number(p.target) || 0), 0);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const rangeDays = Math.round((new Date(`${range.end}T00:00:00`) - new Date(`${range.start}T00:00:00`)) / 86400000) + 1;
  const totalTargetSales = ["This Month", "Last Month"].includes(period) ? monthlyTargetSales : Math.round(monthlyTargetSales * rangeDays / daysInMonth);
  const overallAchievement = Math.round((totalAchievedSales / Math.max(1, totalTargetSales)) * 100);

  const leadsTarget = role === "Sales Executive" ? "my-leads" : "leads";

  const stats = [
    ["Total leads", totalLeads, totalLeads > 0 ? `${totalLeads} active` : "No leads", Users, () => navigate?.(leadsTarget)],
    [`Added ${periodLabel}`, leadsAddedToday, leadsAddedToday > 0 ? `${leadsAddedToday} added` : "None added", UserPlus, () => navigate?.(leadsTarget)],
    [`Follow-ups ${periodLabel}`, followupsToday, followupsToday > 0 ? `Due ${periodLabel}` : "None due", CalendarClock, () => navigate?.("follow-ups")],
    ["Overdue follow-ups", overdueFollowups, overdueFollowups > 0 ? "Before selected period" : "Up to date", Clock, () => navigate?.("follow-ups")],
    [`Calls ${periodLabel}`, callsToday, callsToday > 0 ? `Logged ${periodLabel}` : "None logged", Phone, () => navigate?.("calls")],
    ["Converted leads", convertedLeads, totalLeads > 0 ? `${Math.round((convertedLeads / totalLeads) * 100)}% conv.` : "0%", CheckCircle2, () => navigate?.("pipeline")],
    ["Sales", salesLeads, salesLeads > 0 ? "Sale status" : "No sales yet", ShoppingBag, () => navigate?.("pipeline")],
  ];

  if (role === "HR") {
    return (
      <>
        <div className="stats-grid four">
          {[
            ["Staff members", staff.length, () => navigate?.("staff")],
            ["Active employees", staff.filter((person) => person.status === "Active").length, () => navigate?.("staff")],
            ["Open tasks", 0],
            ["Salespeople", people.length, () => navigate?.("staff")],
          ].map(([label, value, onClick]) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              icon={Users}
              change="Active staff"
              showComparison={false}
              onClick={onClick}
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
          <Leaderboard people={people} navigate={navigate} loadError={leaderboardLoadError} salespeopleCount={salespeopleCount} onAddSalesperson={onAddSalesperson} />
        </div>
      </>
    );
  }

  const activeSalesExec = role === "Sales Executive"
    ? people.find((person) => person.name === viewerName) || (ownAccount && {
        ...ownAccount,
        sales: leads.filter((lead) =>
          lead.assigned === viewerName &&
          lead.status === "Sale" &&
          String(saleDate(lead) || "").slice(0, 7) === todayStr.slice(0, 7)
        ).reduce((sum, lead) => sum + (Number(lead.saleAmount) || 0), 0),
      })
    : people.find((person) => person.role === "Sales Executive") || people[0];

  return (
    <>
      <div className="stats-grid dashboard-stats">
        {stats.map(([label, value, change, icon, onClick], i) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            change={change}
            icon={icon}
            negative={i === 3 && value > 0}
            showComparison={false}
            onClick={onClick}
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
          {totalAchievedSales === 0 && totalTargetSales === 0 ? (
            <EmptyState
              compact
              kind="targets"
              title="No sales activity yet"
              description="Converted lead revenue and team targets will appear here once your team starts tracking sales."
            />
          ) : (
            <>
              <div className="revenue-line">
                <strong>{money(totalAchievedSales)}</strong>
                <span className="positive">
                  <ArrowUpRight size={13} />
                  {overallAchievement}%
                </span>
                <small>of target</small>
                <div className="chart-legend">
                  <span><i />Achieved</span>
                  <span><i />Target</span>
                </div>
              </div>
              <SalesChart range={range} leads={periodSales} targetTotal={totalTargetSales} />
              <div className="chart-footer">
                <span>Target <strong>{money(totalTargetSales)}</strong></span>
                <span><span className="positive">{overallAchievement}%</span> of target achieved</span>
              </div>
            </>
          )}
        </section>
        <Leaderboard people={people} navigate={navigate} loadError={leaderboardLoadError} salespeopleCount={salespeopleCount} onAddSalesperson={onAddSalesperson} />
      </div>
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Calls {periodLabel}</h2>
            <p className="section-subtitle">Calls logged {periodLabel}</p>
          </div>
          <button onClick={() => navigate("calls")}>View all calls <ArrowRight size={14} /></button>
        </div>
        {periodCalls.length ? (
          <DataTable
            rows={periodCalls.slice(0, 5)}
            columns={[
              { key: "name", label: "Customer", render: (call) => call.name || "Unknown caller" },
              { key: "phone", label: "Phone", render: (call) => call.phone || "—" },
              { key: "assigned", label: "Assigned to" },
              { key: "callTime", label: "Time" },
              { key: "callStatus", label: "Status", render: (call) => <StatusBadge status={call.callStatus} /> },
            ]}
          />
        ) : (
          <p className="muted" style={{ padding: "20px" }}>No calls logged {periodLabel}.</p>
        )}
      </section>
    </>
  );
}
