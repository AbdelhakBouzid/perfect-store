export default function LayoutShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-100/80 via-white to-accent-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
      <div className="pointer-events-none absolute -top-44 -left-36 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-accent-200/45 blur-3xl dark:bg-accent-700/20" />
      <div className="relative min-h-screen">{children}</div>
    </div>
  );
}
