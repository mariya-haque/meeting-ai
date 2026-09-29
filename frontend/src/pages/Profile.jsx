import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format.js";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="card flex items-center gap-4">
        {user.profile_image ? (
          <img src={user.profile_image} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-slate-500 dark:text-slate-400">{user.email}</div>
        </div>
      </div>

      <div className="card space-y-2 text-sm">
        <Row label="Account created" value={formatDate(user.created_at, "PPP")} />
        <Row
          label="Google connected"
          value={user.google_id ? "Yes ✅" : "No — sign in with Google to sync calendar"}
        />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
