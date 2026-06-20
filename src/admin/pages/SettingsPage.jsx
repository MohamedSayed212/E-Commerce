import React, { useState, useEffect } from "react";
import { RiUserLine, RiCheckLine, RiShieldLine } from "react-icons/ri";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../AdminAuthContext";

export default function SettingsPage() {
  const { admin } = useAdminAuth();

  // Profile form
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    if (!admin) return;
    setEmail(admin.email || "");
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", admin.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            phone: data.phone || "",
          });
        }
        setProfileLoading(false);
      });
  }, [admin]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone })
      .eq("id", admin.id);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.password.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (pwForm.password !== pwForm.confirm) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.password });
    setPwSaving(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setPwForm({ password: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    }
  };

  const avatarInitial = form.full_name
    ? form.full_name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-secondary dark:text-gray-400 mt-0.5">
          Manage your admin profile and preferences.
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <RiUserLine className="text-primary text-lg" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
        </div>

        <div className="p-6">
          {profileLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-5">
              {/* Avatar preview */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {avatarInitial}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {form.full_name || "Admin"}
                  </p>
                  <p className="text-sm text-secondary dark:text-gray-400">{email}</p>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                  <span className="ml-2 text-xs text-secondary dark:text-gray-500 font-normal">
                    (managed by Supabase Auth)
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 text-secondary dark:text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {saveError && (
                <p className="text-sm text-red-500">{saveError}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primaryHover transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <RiCheckLine />
                    Saved
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <RiShieldLine className="text-primary text-lg" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Change password</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={pwForm.password}
                onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder="Repeat your new password"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {pwError && (
              <p className="text-sm text-red-500">{pwError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pwSaving}
                className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primaryHover transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pwSaving ? "Updating…" : "Update password"}
              </button>
              {pwSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <RiCheckLine />
                  Password updated
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
