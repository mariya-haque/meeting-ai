import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/calendar", label: "Calendar", icon: "📅" },
  { to: "/upcoming", label: "Upcoming", icon: "⏰" },
  { to: "/history", label: "Meeting History", icon: "🗂️" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/meetings/new", label: "Add Meeting", icon: "➕" },
  { to: "/profile", label: "Profile", icon: "👤" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-700 dark:bg-slate-800 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-700">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold">Meeting AI</span>
        </div>
        <nav className="space-y-1 p-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
