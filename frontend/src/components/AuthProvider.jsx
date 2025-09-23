import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import { AuthContext } from "../contexts/auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // attempt auto-login if token exists
  useEffect(() => {
    async function init() {
      try {
        await apiClient
          .getMe()
          .then((res) => {
            // backend /profile returns { msg: "Hello, <username>!" }
            const username = (res?.msg || "")
              .replace("Hello, ", "")
              .replace("!", "");
            setUser({ username });
          })
          .catch(() => {
            apiClient.signOut();
            setUser(null);
          });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const signUp = async (username, email, password) => {
    try {
      await apiClient.signUp(username, email, password);
      // optional: auto-login after signup
      await apiClient.signIn(username, password);
      const me = await apiClient.getMe();
      const uname = (me?.msg || "").replace("Hello, ", "").replace("!", "");
      setUser({ username: uname });
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signIn = async (username, password) => {
    try {
      await apiClient.signIn(username, password);
      const me = await apiClient.getMe();
      const uname = (me?.msg || "").replace("Hello, ", "").replace("!", "");
      setUser({ username: uname });
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signOut = () => {
    apiClient.signOut();
    setUser(null);
  };

  const value = { user, loading, signUp, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
