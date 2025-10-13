import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import { AuthContext } from "../contexts/auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Extract username safely
  function parseUsername(msg) {
    return (msg || "")
      .replace("Hello, ", "")
      .replace("!", "")
      .replace(/[^a-zA-Z0-9_]/g, "");
  }

  // Core: Validate session
  async function validateSession() {
    const token = localStorage.getItem("moviehub_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const res = await apiClient.getMe();
      const uname = parseUsername(res?.msg);
      if (uname) {
        setUser({ username: uname });
      } else {
        apiClient.signOut();
        setUser(null);
      }
    } catch {
      apiClient.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Run on startup
  useEffect(() => {
    validateSession();
  }, []);

  // Listen for token deletion (manual or from another tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "moviehub_token" && !event.newValue) {
        apiClient.signOut();
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auth actions
  const signUp = async (username, email, password) => {
    try {
      await apiClient.signUp(username, email, password);
      await apiClient.signIn(username, password);
      await validateSession();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signIn = async (username, password) => {
    try {
      await apiClient.signIn(username, password);
      await validateSession();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signOut = () => {
    apiClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
