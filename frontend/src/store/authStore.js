import { create } from "zustand";
import API from "../utils/api";

export const useAuthStore = create((set) => ({
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post("/login", { username, password });
      localStorage.setItem("token", response.data.access_token);
      return true;
    } catch (err) {
      console.log(err);
      set({ error: "Invalid username or password" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      await API.post("/signup", { email, password, username });
    } catch (err) {
      set({ error: err.response?.data?.detail || "Signup failed" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
