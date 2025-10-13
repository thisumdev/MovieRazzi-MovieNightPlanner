// Secure and environment-aware API client implementatioon

// Automatically detect the correct protocol (HTTP or HTTPS)
const DEFAULT_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;

let token = localStorage.getItem("moviehub_token") || null;

// Token management

function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("moviehub_token", newToken);
  } else {
    localStorage.removeItem("moviehub_token");
  }
}

// JWT expiration safety check

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
}

// Secure request handler

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  // Only attach token if valid and not expired
  if (token && !isTokenExpired(token)) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (token) {
    console.warn("Expired or invalid token removed.");
    setToken(null);
  }

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
      console.error("API error:", error);
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// API endpoints

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
