import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { MEETING_STATUSES, PLATFORMS } from "../utils/format.js";

const empty = {
  title: "",
  platform: "google_meet",
  meeting_date: "",
  start_time: "",
  end_time: "",
  meeting_link: "",
  company: "",
  status: "upcoming",
  summary: "",
  discussion: "",
  decisions: "",
  next_steps: "",
  notes: "",
  follow_up_date: "",
  zoom_meeting_id: "",
  zoom_passcode: "",
};

export default function MeetingForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [participants, setParticipants] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    api.get(`/meetings/${id}`).then((res) => {
      const m = res.data;
      setForm({
        ...empty,
        ...Object.fromEntries(
          Object.keys(empty).map((k) => [k, m[k] ?? ""])
        ),
      });
      setParticipants(m.participants.map((p) => ({ name: p.name, email: p.email || "" })));
    });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addParticipant = () => setParticipants((p) => [...p, { name: "", email: "" }]);
  const updateParticipant = (i, key, value) =>
    setParticipants((p) => p.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  const removeParticipant = (i) =>
    setParticipants((p) => p.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // Clean empty strings -> null for optional fields; keep dates as-is.
    const payload = { ...form };
    for (const k of Object.keys(payload)) {
      if (payload[k] === "") payload[k] = null;
    }
    payload.title = form.title;
    payload.platform = form.platform;
    payload.status = form.status;
    payload.participants = participants.filter((p) => p.name.trim());

    try {
      if (editing) {
        await api.put(`/meetings/${id}`, payload);
        navigate(`/meetings/${id}`);
      } else {
        const res = await api.post("/meetings", payload);
        navigate(`/meetings/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save meeting.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{editing ? "Edit Meeting" : "Add Meeting"}</h1>
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Platform</label>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {MEETING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.meeting_date || ""}
                onChange={(e) => set("meeting_date", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Company / Client</label>
              <input
                className="input"
                value={form.company || ""}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Start time</label>
              <input
                type="time"
                className="input"
                value={form.start_time || ""}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div>
              <label className="label">End time</label>
              <input
                type="time"
                className="input"
                value={form.end_time || ""}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Meeting link</label>
            <input
              className="input"
              placeholder="https://meet.google.com/… or Zoom URL"
              value={form.meeting_link || ""}
              onChange={(e) => set("meeting_link", e.target.value)}
            />
          </div>

          {form.platform === "zoom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Zoom Meeting ID</label>
                <input
                  className="input"
                  value={form.zoom_meeting_id || ""}
                  onChange={(e) => set("zoom_meeting_id", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Zoom Passcode</label>
                <input
                  className="input"
                  value={form.zoom_passcode || ""}
                  onChange={(e) => set("zoom_passcode", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Participants</h2>
            <button type="button" className="btn-ghost" onClick={addParticipant}>
              ➕ Add
            </button>
          </div>
          {participants.length === 0 && (
            <p className="text-sm text-slate-400">No participants added.</p>
          )}
          {participants.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input"
                placeholder="Name"
                value={p.name}
                onChange={(e) => updateParticipant(i, "name", e.target.value)}
              />
              <input
                className="input"
                placeholder="Email"
                value={p.email}
                onChange={(e) => updateParticipant(i, "email", e.target.value)}
              />
              <button
                type="button"
                className="btn-danger"
                onClick={() => removeParticipant(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Notes & summary */}
        <div className="card space-y-4">
          <h2 className="font-semibold">Notes &amp; Summary</h2>
          {[
            ["summary", "Meeting summary"],
            ["discussion", "Discussion points"],
            ["decisions", "Decisions made"],
            ["next_steps", "Next steps"],
            ["notes", "Personal notes"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea
                className="input min-h-[80px]"
                value={form[key] || ""}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className="label">Follow-up date</label>
            <input
              type="date"
              className="input"
              value={form.follow_up_date || ""}
              onChange={(e) => set("follow_up_date", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : editing ? "Update Meeting" : "Create Meeting"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
