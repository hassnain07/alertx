import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false, // 🔥 added

  // ───────────────────────────────
  // REGISTER USER
  // ───────────────────────────────
  register: async (userData) => {
    try {
      set({ loading: true });

      const res = await fetch("http://localhost:3000/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error, loading: false });
        return { success: false, error: data.error };
      }

      return { success: true, data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // ───────────────────────────────
  // LOGIN USER
  // ───────────────────────────────
  login: async (email, password) => {
    try {
      set({ loading: true });

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error, loading: false });
        return { success: false, error: data.error };
      }

      // Save both user and token
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      set({
        user: data.user,
        token: data.token,
        loading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // ───────────────────────────────
  // RESTORE SESSION (like on page refresh)
  // ───────────────────────────────
  restoreSession: () => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      set({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        initialized: true,
      });
    } else {
      set({
        initialized: true, // 🔥 must always set this
      });
    }
  },

  // ───────────────────────────────
  // LOGOUT
  // ───────────────────────────────
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
