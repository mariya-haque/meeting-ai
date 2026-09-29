import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate, platformLabel } from "../utils/format.js";

export default function MeetingCard({ meeting }) {
  return (
    <Link to={`/meetings/${meeting.id}`} className="card block transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{meeting.title}</h3>
          {meeting.company && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{meeting.company}</p>
          )}
        </div>
        <StatusBadge value={meeting.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        <span>📅 {formatDate(meeting.meeting_date) || "—"}</span>
        {meeting.start_time && <span>🕒 {meeting.start_time}{meeting.end_time ? `–${meeting.end_time}` : ""}</span>}
        <span>💻 {platformLabel(meeting.platform)}</span>
      </div>

      {meeting.participants?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {meeting.participants.slice(0, 4).map((p) => (
            <span
              key={p.id}
              className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              {p.name}
            </span>
          ))}
          {meeting.participants.length > 4 && (
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700">
              +{meeting.participants.length - 4}
            </span>
          )}
        </div>
      )}

      {meeting.meeting_link && (
        <a
          href={meeting.meeting_link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Join link ↗
        </a>
      )}
    </Link>
  );
}
