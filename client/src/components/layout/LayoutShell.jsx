export default function LayoutShell({ children, centered = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-700 dark:bg-[#0a1348]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/30 via-indigo-500/20 to-cyan-500/30 dark:from-sky-900/60 dark:via-indigo-950/70 dark:to-cyan-900/50" />
      <div className="pointer-events-none absolute -top-32 start-0 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 end-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <div
        className={`relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 ${
          centered ? "flex min-h-screen items-center justify-center" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
