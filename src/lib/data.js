export const roles = [
  "Super Admin",
  "Data Analytics Manager",
  "Team Lead",
  "Sales Executive",
];

export const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export const shortMoney = (n) => {
  const num = Number(n || 0);
  if (num >= 100000) {
    return "₹" + (num / 100000).toFixed(1).replace(".0", "") + "L";
  }
  if (num >= 1000) {
    return "₹" + (num / 1000).toFixed(1).replace(".0", "") + "k";
  }
  return "₹" + num.toLocaleString("en-IN");
};

export const rankExecutives = (people = []) =>
  [...people].sort((a, b) => {
    const aPct = (a.sales || 0) / Math.max(1, a.target || 1);
    const bPct = (b.sales || 0) / Math.max(1, b.target || 1);
    return bPct - aPct || (b.sales || 0) - (a.sales || 0);
  });

export const statuses = [
  "Leads",
  "Not Connected",
  "Contacted",
  "Follow-up",
  "Qualified",
  "Converted",
  "Sale",
  "Not Qualified",
  "Lost",
];

export const sources = [
  "Facebook",
  "WhatsApp",
  "Instagram",
  "Direct",
  "Other",
  "Referral",
];

export const priorities = ["Cool", "Hot", "Cold"];
export const convertedStatuses = ["Won", "Converted", "Sale"];
export const closedStatuses = [...convertedStatuses, "Not Qualified", "Lost"];

export const normalizeLead = (lead) => {
  const service = lead?.service || "";
  const saleAmount = Number(lead?.saleAmount ?? 0);
  return {
    ...lead,
    id: lead.customId ?? lead.id ?? lead._id,
    service,
    saleAmount,
    advanceAmount: Number(
      lead.advanceAmount ??
        (convertedStatuses.includes(lead.status)
          ? Math.round((saleAmount * 0.25) / 1000) * 1000
          : 0),
    ),
    notes: lead.notes || [],
    activities: lead.activities || [],
  };
};

export const getNoteText = (notes) => {
  if (!notes) return "";
  if (typeof notes === "string") {
    if (notes === "[object Object]" || notes.startsWith("[object Object]")) {
      return "";
    }
    return notes.trim();
  }
  if (Array.isArray(notes)) {
    return notes
      .map((n) => (typeof n === "string" ? n : n?.text || ""))
      .filter((t) => t && t !== "[object Object]")
      .join("\n")
      .trim();
  }
  if (typeof notes === "object") {
    return (notes.text || notes.note || "").trim();
  }
  return String(notes).trim();
};

export const isCallToday = (call, today = new Date()) => {
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const callDate = String(call.callDate || "").trim();
  if (callDate) return callDate === todayIso || callDate === todayLabel || callDate === "Today";
  const timestamp = call.startedAt || call.createdAt;
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
};
export const normalizeCall = (call) => {
  if (!call) return null;
  return {
    ...call,
    id: call._id || call.id,
    notes: getNoteText(call.notes),
    recordingStatus: call.recordingStatus || (call.recordingUrl || call.recordingSid ? "Available" : "Not recorded"),
    callType: call.callType || "manual",
    duration: call.duration || "00:00",
  };
};

export const normalizeFollowup = (followup) => ({
  ...followup,
  id: followup._id || followup.id,
  notes: typeof followup.notes === "string" ? followup.notes : "",
});

// Clean initial empty datasets (no dummy data)
export const initialLeads = [];
export const initialFollowups = [];
export const calls = [];
export const chartData = [];
export const notifications = [];

export const access = {
  "Super Admin": [
    "dashboard",
    "leads",
    "my-leads",
    "follow-ups",
    "pipeline",
    "leaderboard",
    "targets",
    "customers",
    "calls",
    "staff",
    "performance",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
    "users",
    "courses",
    "settings",
  ],
  Manager: [
    "dashboard",
    "leads",
    "my-leads",
    "follow-ups",
    "pipeline",
    "leaderboard",
    "targets",
    "customers",
    "calls",
    "staff",
    "performance",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
  ],
  HR: ["dashboard", "staff", "tasks", "performance", "leaderboard"],
  "Data Analytics Manager": [
    "dashboard",
    "leads",
    "follow-ups",
    "pipeline",
    "targets",
    "customers",
    "calls",
    "staff",
    "tasks",
    "performance",
    "leaderboard",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
    "users",
    "courses",
    // "settings",
  ],
  "Team Lead": [
    "dashboard",
    "leads",
    "my-leads",
    "follow-ups",
    "pipeline",
    "customers",
    "calls",
    "staff",
    "leaderboard",
    "performance",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
  ],
  "Sales Executive": [
    "dashboard",
    "my-leads",
    "customers",
    "follow-ups",
    "pipeline",
    "calls",
    "leaderboard",
    "performance",
  ],
};
