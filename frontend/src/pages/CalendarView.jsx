import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import api from "../api/client.js";

export default function CalendarView() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [meetings, setMeetings] = useState([]);
  const [syncMsg, setSyncMsg] = useState("");

  const load = () => api.get("/meetings").then((res) => setMeetings(res.data));

  useEffect(() => {
    load();
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const meetingsByDay = (day) =>
    meetings.filter((m) => {
      if (!m.meeting_date) return false;
      try {
        return isSameDay(parseISO(m.meeting_date), day);
      } catch {
        return false;
      }
    });

  const sync = async () => {
    setSyncMsg("Syncing…");
    try {
      const res = await api.post("/calendar/sync");
      setSyncMsg(`Imported ${res.data.imported} of ${res.data.total_events} events.`);
      load();
    } catch (err) {
      setSyncMsg(err.response?.data?.detail || "Sync failed (connect Google first).");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setCursor(addMonths(cursor, -1))}>
            ←
          </button>
          <span className="min-w-[10rem] text-center font-semibold">
            {format(cursor, "MMMM yyyy")}
          </span>
          <button className="btn-ghost" onClick={() => setCursor(addMonths(cursor, 1))}>
            →
          </button>
          <button className="btn-ghost" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </button>
          <button className="btn-primary" onClick={sync}>
            🔄 Sync Google
          </button>
        </div>
      </div>

      {syncMsg && <p className="text-sm text-slate-500">{syncMsg}</p>}

      <div className="card overflow-x-auto p-0">
        <div className="grid min-w-[700px] grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="p-2 text-center text-xs font-semibold uppercase text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid min-w-[700px] grid-cols-7">
          {days.map((day) => {
            const dayMeetings = meetingsByDay(day);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[96px] border-b border-r border-slate-100 p-1.5 dark:border-slate-700 ${
                  isSameMonth(day, cursor) ? "" : "bg-slate-50/60 dark:bg-slate-900/40"
                }`}
              >
                <div
                  className={`mb-1 text-right text-xs ${
                    today
                      ? "inline-block rounded bg-brand-600 px-1.5 font-bold text-white"
                      : "text-slate-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayMeetings.slice(0, 3).map((m) => (
                    <Link
                      key={m.id}
                      to={`/meetings/${m.id}`}
                      className="block truncate rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700 hover:bg-brand-100 dark:bg-brand-700/20 dark:text-brand-100"
                      title={m.title}
                    >
                      {m.start_time ? `${m.start_time} ` : ""}
                      {m.title}
                    </Link>
                  ))}
                  {dayMeetings.length > 3 && (
                    <div className="text-xs text-slate-400">
                      +{dayMeetings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
