import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import MeetingCard from "../components/MeetingCard.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/upcoming", { params: { limit: 5 } }),
      api.get("/dashboard/completed", { params: { limit: 5 } }),
    ])
      .then(([s, u, c]) => {
        setStats(s.data);
        setUpcoming(u.data);
        setCompleted(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/meetings/new" className="btn-primary">
          ➕ New Meeting
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Meetings" value={stats.total_meetings} icon="📊" />
        <StatCard label="This Week" value={stats.meetings_this_week} icon="📆" accent="green" />
        <StatCard label="Upcoming" value={stats.upcoming_meetings} icon="⏰" accent="amber" />
        <StatCard label="Completed" value={stats.completed_meetings} icon="✔️" accent="green" />
        <StatCard label="This Month" value={stats.meetings_this_month} icon="🗓️" />
        <StatCard label="Pending Tasks" value={stats.pending_tasks} icon="📝" accent="red" />
        <StatCard label="Total Tasks" value={stats.total_tasks} icon="✅" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
          <Link to="/upcoming" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="card text-slate-400">No upcoming meetings.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently Completed</h2>
          <Link to="/history" className="text-sm text-brand-600 hover:underline">
            View history
          </Link>
        </div>
        {completed.length === 0 ? (
          <p className="card text-slate-400">No completed meetings yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
