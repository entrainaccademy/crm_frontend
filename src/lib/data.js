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
  "Contacted",
  "Follow-up",
  "Qualified",
  "Converted",
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

export const priorities = ["Cold", "Warm", "Hot"];
export const convertedStatuses = ["Won", "Converted"];
export const closedStatuses = [...convertedStatuses, "Not Qualified", "Lost"];

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

const legacyCourses = {
  "Digital Marketing": courses[0].name,
  "Web Development": courses[1].name,
  "Business Consulting": courses[2].name,
  "Brand Strategy": courses[3].name,
  "Professional Chef Diploma": courses[0].name,
  "Bakery & Patisserie Diploma": courses[1].name,
  "Culinary Arts Certificate": courses[2].name,
  "Advanced Baking Certificate": courses[3].name,
  "Food Production & Kitchen Management": courses[4].name,
  "Barista & Beverage Arts": courses[5].name,
};

export const normalizeLead = (lead) => {
  const service = legacyCourses[lead?.service] || lead?.service || courses[0].name;
  const saleAmount = Number(lead?.saleAmount ?? courseFees[service] ?? 0);
  return {
    ...lead,
    id: lead.id || lead.customId || lead._id,
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
    "settings",
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
