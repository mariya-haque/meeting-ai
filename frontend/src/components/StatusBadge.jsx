const styles = {
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export default function StatusBadge({ value }) {
  const label = String(value || "").replace("_", " ");
  return (
    <span className={`badge ${styles[value] || styles.low}`}>{label}</span>
  );
}
