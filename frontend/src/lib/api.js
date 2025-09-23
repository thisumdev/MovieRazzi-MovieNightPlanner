// Simple API client for auth endpoints
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let token = localStorage.getItem("moviehub_token") || null;

function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("moviehub_token", newToken);
  } else {
    localStorage.removeItem("moviehub_token");
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const err = await res.json();
      msg = err.detail || err.message || msg;
    } catch (error) {
      console.log(error);
      throw new Error(msg);
    }
  }
  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  setToken,

  async signUp(username, email, password) {
    const data = await request("/signup", {
      method: "POST",
      body: { username, email, password },
    });
    return data;
  },

  async signIn(username, password) {
    const data = await request("/login", {
      method: "POST",
      body: { username, password },
    });
    // backend returns { access_token, token_type }
    if (data?.access_token) setToken(data.access_token);
    return data;
  },

  async getMe() {
    return request("/profile");
  },

  signOut() {
    setToken(null);
  },
};
