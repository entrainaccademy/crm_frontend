const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn(`API request to ${endpoint} failed:`, err.message);
    return { success: false, error: err.message };
  }
}

export const api = {
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
