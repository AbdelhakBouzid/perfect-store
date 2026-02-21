export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed end-5 top-5 z-50 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      {message}
    </div>
  );
}
