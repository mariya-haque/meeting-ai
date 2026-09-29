export default function StatCard({ label, value, icon, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-700/20",
    green: "bg-green-50 text-green-600 dark:bg-green-700/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-700/20",
    red: "bg-red-50 text-red-600 dark:bg-red-700/20",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl ${accents[accent]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
