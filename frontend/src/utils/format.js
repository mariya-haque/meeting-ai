import { format, parseISO } from "date-fns";

export function formatDate(value, fmt = "MMM d, yyyy") {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? parseISO(value) : value;
    return format(d, fmt);
  } catch {
    return String(value);
  }
}

export function platformLabel(platform) {
  const map = {
    google_meet: "Google Meet",
    zoom: "Zoom",
    other: "Other",
  };
  return map[platform] || platform || "—";
}

export const PLATFORMS = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "other", label: "Other" },
];

export const MEETING_STATUSES = ["upcoming", "completed", "cancelled"];
export const TASK_STATUSES = ["pending", "in_progress", "completed"];
export const PRIORITIES = ["low", "medium", "high"];
