const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
  .trim()
  .replace(/\/+$/, "");
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
const DIAL_HANDOFF_KEY = "entrain-dial-handoff";
const DIAL_HANDOFF_LIFETIME = 2 * 60 * 60 * 1000;

export function prepareDialHandoff() {
  const token = sessionStorage.getItem("entrain-token");
  if (token) {
    try {
      localStorage.setItem(DIAL_HANDOFF_KEY, JSON.stringify({ token, expiresAt: Date.now() + DIAL_HANDOFF_LIFETIME }));
    } catch {
      // The current tab can still complete the call if persistent storage is unavailable.
    }
  }
}

export function restoreDialHandoff() {
  if (sessionStorage.getItem("entrain-token")) return;
  try {
    const handoff = JSON.parse(localStorage.getItem(DIAL_HANDOFF_KEY) || "null");
    if (handoff?.token && handoff.expiresAt > Date.now()) {
      sessionStorage.setItem("entrain-token", handoff.token);
    }
  } catch {
    // A damaged handoff cannot be used to restore the session.
  } finally {
    clearDialHandoff();
  }
}

export function clearDialHandoff() {
  try {
    localStorage.removeItem(DIAL_HANDOFF_KEY);
  } catch {
    // Persistent storage may be disabled in the browser.
  }
}

async function request(endpoint, options = {}) {
  try {
    const { headers, ...rest } = options;
    const token = typeof window !== "undefined" ? sessionStorage.getItem("entrain-token") : null;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      cache: "no-store",
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    });
    const json = await res.json();
    if (res.status === 401 && endpoint !== "/auth/login") {
      sessionStorage.removeItem("entrain-token");
      clearDialHandoff();
      window.dispatchEvent(new Event("entrain-session-expired"));
    }
    return json;
  } catch (err) {
    console.warn(`API request to ${endpoint} failed:`, err.message);
    return { success: false, error: "Could not connect to the server. Please try again." };
  }
}

export const api = {
  async login(email, password) {
    const res = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!res.success) throw new Error(res.message || res.error || "Sign in failed");
    sessionStorage.setItem("entrain-token", res.data.token);
    return res.data;
  },
  async me() {
    const res = await request("/auth/me");
    return res.success ? res.data : null;
  },
  async updateProfile(data) {
    const res = await request("/auth/me", { method: "PATCH", body: JSON.stringify(data) });
    if (!res.success) throw new Error(res.message || res.error || "Could not update profile");
    return res.data;
  },
  logout() {
    sessionStorage.removeItem("entrain-token");
    clearDialHandoff();
  },
  async getNotifications() {
    const res = await request("/notifications", { cache: "no-store" });
    return res.success ? res.data : null;
  },
  async markNotificationRead(id) {
    const res = await request(`/notifications/${id}/read`, { method: "PATCH" });
    return res.success ? res.data : null;
  },
  async markAllNotificationsRead() {
    const res = await request("/notifications/read-all", { method: "PATCH" });
    return res.success;
  },
  async createUser(data) {
    const res = await request("/users", { method: "POST", body: JSON.stringify(data) });
    if (!res.success) throw new Error(res.message || res.error || "Could not create user");
    return res.data;
  },
  async updateUser(id, data) {
    const res = await request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
    if (!res.success) throw new Error(res.message || res.error || "Could not update user");
    return res.data;
  },
  // Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/leads${query ? `?${query}` : ""}`);
    return res.success ? res.data : null;
  },
  async getAllLeads() {
    const pageSize = 250;
    const first = await request(`/leads?page=1&limit=${pageSize}`);
    if (!first.success || !Array.isArray(first.data)) return null;

    const total = Number(first.total);
    if (!Number.isFinite(total) || total <= first.data.length) return first.data;

    const leads = [...first.data];
    for (let page = 2; page <= Math.ceil(total / pageSize); page++) {
      const next = await request(`/leads?page=${page}&limit=${pageSize}`);
      if (!next.success || !Array.isArray(next.data)) return null;
      leads.push(...next.data);
    }
    return leads;
  },
  async getLead(id) {
    const res = await request(`/leads/${id}`);
    return res.success ? res.data : null;
  },
  async createLead(data) {
    const res = await request("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.code === "DUPLICATE_PHONE") {
      throw new Error(res.message);
    }
    return res.success ? res.data : null;
  },
  async updateLead(id, data) {
    const res = await request(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.code === "DUPLICATE_PHONE") {
      throw new Error(res.message);
    }
    return res.success ? res.data : null;
  },
  async deleteLead(id) {
    const res = await request(`/leads/${id}`, { method: "DELETE" });
    return res.success;
  },

  // Follow-ups
  async getFollowups() {
    const res = await request("/followups");
    return res.success ? res.data : null;
  },
  async createFollowup(data) {
    const res = await request("/followups", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async updateFollowup(id, data) {
    const res = await request(`/followups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async toggleFollowup(id) {
    const res = await request(`/followups/${id}/toggle`, { method: "PATCH" });
    return res.success ? res.data : null;
  },
  async deleteFollowup(id) {
    const res = await request(`/followups/${id}`, { method: "DELETE" });
    return res.success;
  },

  // Calls
  async getCalls(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/calls${query ? `?${query}` : ""}`);
    return res.success ? res.data : null;
  },
  async getCall(id) {
    const res = await request(`/calls/${id}`);
    return res.success ? res.data : null;
  },
  async createCall(data) {
    const res = await request("/calls", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async updateCall(id, data) {
    const res = await request(`/calls/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async deleteCall(id) {
    const res = await request(`/calls/${id}`, { method: "DELETE" });
    return res.success;
  },

  // Telephony & Call Recording
  async getTelephonyStatus() {
    const res = await request("/telephony/status");
    return res.success ? res.data : { isConfigured: false, missing: ["SERVER_ERROR"] };
  },
  async initiateTelephonyCall(data) {
    const res = await request("/telephony/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },
  async getTelephonyCallStatus(callId) {
    const res = await request(`/telephony/call/${callId}/status`);
    return res.success ? res.data : null;
  },
  getCallAudioStreamUrl(callId) {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("entrain-token") : "";
    return `${API_BASE}/calls/${callId}/audio${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },

  // Users
  async getUsers() {
    const res = await request("/users");
    return res.success ? res.data : null;
  },
  async getLeaderboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/users/leaderboard${query ? `?${query}` : ""}`, { cache: "no-store" });
    return res.success ? res.data : null;
  },

  // Tasks
  async getTasks() {
    const res = await request("/tasks");
    return res.success ? res.data : null;
  },
  async createTask(data) {
    const res = await request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async updateTask(id, data) {
    const res = await request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },

  // Courses
  async getCourses(includeInactive = false) {
    const res = await request(`/courses${includeInactive ? "?includeInactive=true" : ""}`);
    return res.success ? res.data : null;
  },
  async createCourse(data) {
    const res = await request("/courses", { method: "POST", body: JSON.stringify(data) });
    if (!res.success) throw new Error(res.message || res.error || "Could not create course");
    return res.data;
  },
  async updateCourse(id, data) {
    const res = await request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
    if (!res.success) throw new Error(res.message || res.error || "Could not update course");
    return res.data;
  },
  async deleteCourse(id) {
    const res = await request(`/courses/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.message || res.error || "Could not archive course");
    return res.data;
  },
  async permanentlyDeleteCourse(id) {
    const res = await request(`/courses/${id}/permanent`, { method: "DELETE" });
    if (!res.success) throw new Error(res.message || res.error || "Could not delete course");
    return res.data;
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await request("/dashboard/stats");
    return res.success ? res.data : null;
  },
};
