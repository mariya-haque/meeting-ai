import { useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function Settings() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const [health, setHealth] = useState(null);

  const connectGoogle = async () => {
    try {
      const res = await api.get("/auth/google/login");
      window.location.href = res.data.url;
    } catch (err) {
      setHealth(err.response?.data?.detail || "Google OAuth is not configured.");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card flex items-center justify-between">
        <div>
          <div className="font-medium">Dark mode</div>
          <div className="text-sm text-slate-400">Toggle the interface theme</div>
        </div>
        <button className="btn-ghost" onClick={toggle}>
          {dark ? "🌙 On" : "☀️ Off"}
        </button>
      </div>

      <div className="card space-y-3">
        <div>
          <div className="font-medium">Google Calendar</div>
          <div className="text-sm text-slate-400">
            {user?.google_id
              ? "Connected. You can sync events from the Calendar page."
              : "Connect your Google account to sync meetings and create Meet links."}
          </div>
        </div>
        {!user?.google_id && (
          <button className="btn-primary" onClick={connectGoogle}>
            Connect Google
          </button>
        )}
        {health && <p className="text-sm text-red-500">{health}</p>}
      </div>

      <div className="card">
        <div className="font-medium">Zoom</div>
        <div className="text-sm text-slate-400">
          Zoom meetings are logged manually (link, meeting ID, passcode) when you add or
          edit a meeting and choose the Zoom platform.
        </div>
      </div>
    </div>
  );
}
