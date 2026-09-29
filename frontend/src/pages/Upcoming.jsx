import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import MeetingCard from "../components/MeetingCard.jsx";

export default function Upcoming() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/meetings", { params: { status: "upcoming" } })
      .then((res) => setMeetings(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upcoming Meetings</h1>
        <Link to="/meetings/new" className="btn-primary">
          ➕ New Meeting
        </Link>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : meetings.length === 0 ? (
        <p className="card text-slate-400">No upcoming meetings scheduled.</p>
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
