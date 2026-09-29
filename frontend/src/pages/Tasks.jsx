import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, PRIORITIES, TASK_STATUSES } from "../utils/format.js";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ title: "", priority: "medium", due_date: "" });

  const load = () => {
    const params = filter ? { status: filter } : {};
    api.get("/tasks", { params }).then((res) => setTasks(res.data));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.post("/tasks", {
      title: form.title,
      priority: form.priority,
      due_date: form.due_date || null,
    });
    setForm({ title: "", priority: "medium", due_date: "" });
    load();
  };

  const setStatus = async (t, status) => {
    await api.put(`/tasks/${t.id}`, { status });
    load();
  };

  const remove = async (t) => {
    await api.delete(`/tasks/${t.id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tasks</h1>

      <form onSubmit={add} className="card flex flex-wrap gap-2">
        <input
          className="input flex-1"
          placeholder="Add a task…"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <select
          className="input w-32"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input w-40"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
        <button className="btn-primary">Add task</button>
      </form>

      <div className="flex gap-2">
        <button
          className={filter === "" ? "btn-primary" : "btn-ghost"}
          onClick={() => setFilter("")}
        >
          All
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s}
            className={filter === s ? "btn-primary" : "btn-ghost"}
            onClick={() => setFilter(s)}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-700">
        {tasks.length === 0 && <p className="py-3 text-slate-400">No tasks found.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 py-3">
            <input
              type="checkbox"
              checked={t.status === "completed"}
              onChange={() =>
                setStatus(t, t.status === "completed" ? "pending" : "completed")
              }
              className="h-4 w-4"
            />
            <div className="min-w-0 flex-1">
              <div className={t.status === "completed" ? "text-slate-400 line-through" : "font-medium"}>
                {t.title}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                {t.due_date && <span>Due {formatDate(t.due_date)}</span>}
                {t.meeting_id && (
                  <Link to={`/meetings/${t.meeting_id}`} className="text-brand-600 hover:underline">
                    from meeting →
                  </Link>
                )}
              </div>
            </div>
            <StatusBadge value={t.priority} />
            <select
              className="input w-36"
              value={t.status}
              onChange={(e) => setStatus(t, e.target.value)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <button className="btn-danger" onClick={() => remove(t)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
