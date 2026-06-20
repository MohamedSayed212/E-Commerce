import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // True while we're checking the existing session on first load.
  // Prevents the login page from flashing before we know the user is already logged in.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's already an active session (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for login, logout, and token-refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Clean up the listener when the app unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Signs in with email and password.
  // Throws an error if credentials are wrong — the page catches it and shows the message.
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Creates a new account in Supabase.
  // fullName is saved to user_metadata so the profile trigger can use it.
  const register = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
