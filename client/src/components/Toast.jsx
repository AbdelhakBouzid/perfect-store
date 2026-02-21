export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed end-5 top-5 z-50 rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
      {message}
    </div>
  );
}
