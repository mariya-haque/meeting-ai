import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, platformLabel } from "../utils/format.js";

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{children}</p>
    </div>
  );
}

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", due_date: "" });

  const load = () => api.get(`/meetings/${id}`).then((res) => setMeeting(res.data));

  useEffect(() => {
    load();
  }, [id]);

  const remove = async () => {
    if (!confirm("Delete this meeting?")) return;
    await api.delete(`/meetings/${id}`);
    navigate("/history");
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await api.post("/tasks", {
      title: taskForm.title,
      priority: taskForm.priority,
      due_date: taskForm.due_date || null,
      meeting_id: Number(id),
    });
    setTaskForm({ title: "", priority: "medium", due_date: "" });
    load();
  };

  const toggleTask = async (t) => {
    await api.put(`/tasks/${t.id}`, {
      status: t.status === "completed" ? "pending" : "completed",
    });
    load();
  };

  if (!meeting) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <StatusBadge value={meeting.status} />
          </div>
          {meeting.company && (
            <p className="text-slate-500 dark:text-slate-400">{meeting.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/meetings/${id}/edit`} className="btn-ghost">
            ✏️ Edit
          </Link>
          <button className="btn-danger" onClick={remove}>
            🗑 Delete
          </button>
        </div>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2">
        <Info label="Date" value={formatDate(meeting.meeting_date) || "—"} />
        <Info
          label="Time"
          value={
            meeting.start_time
              ? `${meeting.start_time}${meeting.end_time ? ` – ${meeting.end_time}` : ""}`
              : "—"
          }
        />
        <Info label="Platform" value={platformLabel(meeting.platform)} />
        <Info label="Follow-up" value={formatDate(meeting.follow_up_date) || "—"} />
        {meeting.meeting_link && (
          <div className="sm:col-span-2">
            <span className="text-sm text-slate-400">Link: </span>
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              {meeting.meeting_link}
            </a>
          </div>
        )}
        {meeting.platform === "zoom" && meeting.zoom_meeting_id && (
          <Info
            label="Zoom"
            value={`ID ${meeting.zoom_meeting_id}${
              meeting.zoom_passcode ? ` · Passcode ${meeting.zoom_passcode}` : ""
            }`}
          />
        )}
      </div>

      {meeting.participants.length > 0 && (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Participants
          </h3>
          <div className="flex flex-wrap gap-2">
            {meeting.participants.map((p) => (
              <span
                key={p.id}
                className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {p.name}
                {p.email ? ` · ${p.email}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <Section title="Summary">{meeting.summary}</Section>
        <Section title="Discussion">{meeting.discussion}</Section>
        <Section title="Decisions">{meeting.decisions}</Section>
        <Section title="Next steps">{meeting.next_steps}</Section>
        <Section title="Personal notes">{meeting.notes}</Section>
        {!meeting.summary &&
          !meeting.discussion &&
          !meeting.decisions &&
          !meeting.next_steps &&
          !meeting.notes && (
            <p className="text-sm text-slate-400">
              No notes yet. <Link to={`/meetings/${id}/edit`} className="text-brand-600">Add some →</Link>
            </p>
          )}
      </div>

      {/* Tasks */}
      <div className="card space-y-3">
        <h3 className="font-semibold">Action Items</h3>
        {meeting.tasks.length === 0 && (
          <p className="text-sm text-slate-400">No tasks for this meeting.</p>
        )}
        {meeting.tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={t.status === "completed"}
              onChange={() => toggleTask(t)}
              className="h-4 w-4"
            />
            <span
              className={
                t.status === "completed" ? "text-slate-400 line-through" : ""
              }
            >
              {t.title}
            </span>
            <StatusBadge value={t.priority} />
          </label>
        ))}
        <form onSubmit={addTask} className="flex flex-wrap gap-2 pt-2">
          <input
            className="input flex-1"
            placeholder="New action item…"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <select
            className="input w-32"
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <input
            type="date"
            className="input w-40"
            value={taskForm.due_date}
            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
          />
          <button className="btn-primary">Add</button>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
