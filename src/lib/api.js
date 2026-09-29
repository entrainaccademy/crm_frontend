const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  try {
    const { headers, ...rest } = options;
    const token = typeof window !== "undefined" ? sessionStorage.getItem("entrain-token") : null;
    const res = await fetch(`${API_BASE}${endpoint}`, {
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
      window.dispatchEvent(new Event("entrain-session-expired"));
    }
    return json;
  } catch (err) {
    console.warn(`API request to ${endpoint} failed:`, err.message);
    return { success: false, error: err.message };
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
  logout() {
    sessionStorage.removeItem("entrain-token");
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
  async createLead(data) {
    const res = await request("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },
  async updateLead(id, data) {
    const res = await request(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
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
  async deleteFollowup(id) {
    const res = await request(`/followups/${id}`, { method: "DELETE" });
    return res.success;
  },

  // Calls
  async getCalls() {
    const res = await request("/calls");
    return res.success ? res.data : null;
  },
  async createCall(data) {
    const res = await request("/calls", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.success ? res.data : null;
  },

  // Users
  async getUsers() {
    const res = await request("/users");
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
  async getCourses() {
    const res = await request("/courses");
    return res.success ? res.data : null;
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await request("/dashboard/stats");
    return res.success ? res.data : null;
  },
};
