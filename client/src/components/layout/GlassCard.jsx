export default function GlassCard({ children, className = "" }) {
  return <section className={`surface-glass w-full ${className}`.trim()}>{children}</section>;
}
