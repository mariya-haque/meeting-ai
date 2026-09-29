import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 sm:px-6">
      <button className="btn-ghost lg:hidden" onClick={onMenu} aria-label="Menu">
        ☰
      </button>
      <div className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
        Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost" onClick={toggle} aria-label="Toggle theme">
          {dark ? "🌙" : "☀️"}
        </button>
        <div className="flex items-center gap-2">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
