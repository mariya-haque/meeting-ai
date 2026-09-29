import { useEffect, useState } from "react";
import api from "../api/client.js";
import MeetingCard from "../components/MeetingCard.jsx";
import { MEETING_STATUSES, PLATFORMS } from "../utils/format.js";

export default function History() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    platform: "",
    company: "",
    participant: "",
  });

  const load = () => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );
    api
      .get("/meetings", { params })
      .then((res) => setMeetings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const reset = () => {
    setFilters({ search: "", status: "", platform: "", company: "", participant: "" });
    setTimeout(load, 0);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Meeting History</h1>

      <form onSubmit={onSubmit} className="card grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        <input
          className="input"
          placeholder="Search title, notes, company…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          className="input"
          placeholder="Company"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        />
        <input
          className="input"
          placeholder="Participant"
          value={filters.participant}
          onChange={(e) => setFilters({ ...filters, participant: e.target.value })}
        />
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {MEETING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
        >
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2 md:col-span-3 lg:col-span-5">
          <button className="btn-primary" type="submit">
            Apply filters
          </button>
          <button className="btn-ghost" type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : meetings.length === 0 ? (
        <p className="card text-slate-400">No meetings match your filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  );
}
