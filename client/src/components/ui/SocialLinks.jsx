const LINKS = [
  {
    key: "facebook",
    label: "f",
    href: "https://www.facebook.com/share/17qjZ7UTwD/"
  },
  {
    key: "instagram",
    label: "◉",
    href: "https://www.instagram.com/ba2i3.store?igsh=OTV0dXV4cnBndGp1"
  }
];

export default function SocialLinks({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()}>
      {LINKS.map((item) => (
        <a
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          href={item.href}
          key={item.key}
          rel="noreferrer"
          target="_blank"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
