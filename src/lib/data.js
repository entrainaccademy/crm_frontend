export const roles = [
  "Super Admin",
  "Manager",
  "HR",
  "Data Analytics Manager",
  "Team Leader",
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

export const executives = [
  {
    id: 1,
    name: "Mohammed Ali",
    short: "Mohammed",
    team: "Team Alpha",
    leader: "Rahul Menon",
    target: 500000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 2,
    name: "Niyas Ahmed",
    short: "Niyas",
    team: "Team Alpha",
    leader: "Rahul Menon",
    target: 500000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 3,
    name: "Fasil Rahman",
    short: "Fasil",
    team: "Team Bravo",
    leader: "Priya Nair",
    target: 500000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 4,
    name: "Ameen Hassan",
    short: "Ameen",
    team: "Team Bravo",
    leader: "Priya Nair",
    target: 500000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 5,
    name: "Shamil Khan",
    short: "Shamil",
    team: "Team Charlie",
    leader: "Arjun Das",
    target: 500000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 6,
    name: "Anjali Nair",
    short: "Anjali",
    team: "Team Alpha",
    leader: "Rahul Menon",
    target: 400000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 7,
    name: "Rohan Mehta",
    short: "Rohan",
    team: "Team Bravo",
    leader: "Priya Nair",
    target: 400000,
    sales: 0,
    conversions: 0,
  },
  {
    id: 8,
    name: "Sneha Patel",
    short: "Sneha",
    team: "Team Charlie",
    leader: "Arjun Das",
    target: 400000,
    sales: 0,
    conversions: 0,
  },
];

export const rankExecutives = (people = []) =>
  [...people].sort((a, b) => {
    const aPct = (a.sales || 0) / Math.max(1, a.target || 1);
    const bPct = (b.sales || 0) / Math.max(1, b.target || 1);
    return bPct - aPct || (b.sales || 0) - (a.sales || 0);
  });

export const statuses = [
  "New",
  "Contacted",
  "Follow-up",
  "Interested",
  "Quotation",
  "Won",
  "Lost",
];

export const sources = [
  "Meta Ads",
  "Instagram",
  "Facebook",
  "Website",
  "WhatsApp",
  "Referral",
  "Walk-in",
  "Other",
];

export const courses = [
  { name: "Dessert Workshop", fee: 180000 },
  { name: "One Day Shawarma and Shawai Course", fee: 150000 },
  { name: "One Week Shawarma and Shawai Course", fee: 85000 },
  { name: "One Day Fried Chicken Course", fee: 65000 },
  { name: "One Week Fried Chicken Course", fee: 120000 },
  { name: "One Week Arabian Cuisine Course", fee: 45000 },
];

export const courseFees = Object.fromEntries(
  courses.map((course) => [course.name, course.fee]),
);
export const normalizeLead = (lead) => {
  const service = lead.service || courses[0].name;
  const saleAmount = Number(lead.saleAmount ?? courseFees[service] ?? 0);
  return {
    ...lead,
    id: lead.id || lead.customId || lead._id,
    service,
    saleAmount,
    advanceAmount: Number(
      lead.advanceAmount ??
        (lead.status === "Won"
          ? Math.round((saleAmount * 0.25) / 1000) * 1000
          : 0),
    ),
    notes: lead.notes || [],
    activities: lead.activities || [],
  };
};

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
    "team",
    "performance",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
    "users",
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
    "team",
    "performance",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
  ],
  HR: ["dashboard", "team", "tasks", "performance", "leaderboard"],
  "Data Analytics Manager": [
    "dashboard",
    "performance",
    "leaderboard",
    "sales-reports",
    "lead-reports",
    "call-reports",
    "follow-up-reports",
  ],
  "Team Leader": [
    "dashboard",
    "leads",
    "follow-ups",
    "pipeline",
    "calls",
    "leaderboard",
    "team",
    "performance",
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
