import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

// This context holds the logged-in admin user and provides login/logout functions.
// Any component inside <AdminAuthProvider> can call useAdminAuth() to get this data.
const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On first load, check if there's already an active session
    // (e.g. the user refreshed the page while logged in)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadAdmin(session.user);
      }
      setLoading(false);
    });

    // Listen for login/logout events that happen anywhere in the app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadAdmin(session.user);
        } else {
          setAdmin(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetches the user's profile from our profiles table and checks their role.
  // Only sets admin state if role === 'admin'.
  const loadAdmin = async (user) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      setAdmin({ ...user, ...profile });
    } else {
      setAdmin(null);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Access denied. This account is not an admin.");
    }

    setAdmin({ ...data.user, ...profile });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// A small convenience function so we don't have to import both
// useContext and AdminAuthContext in every component.
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
