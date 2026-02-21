export default function GlassCard({ children, className = "" }) {
  return <section className={`glass-card w-full ${className}`.trim()}>{children}</section>;
}
