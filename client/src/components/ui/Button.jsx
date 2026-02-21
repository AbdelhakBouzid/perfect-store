import { Link } from "react-router-dom";

const VARIANT_STYLES = {
  primary:
    "bg-[#1f2864] text-white hover:bg-[#18204f] border border-transparent shadow-lg shadow-black/20",
  secondary: "bg-white/20 text-white hover:bg-white/30 border border-white/30",
  ghost: "bg-black/15 text-white hover:bg-black/30 border border-white/20",
  danger: "bg-rose-500/70 text-white hover:bg-rose-500/90 border border-rose-300/40"
};

const SIZE_STYLES = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base"
};

function resolveClassName(variant, size, className) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;
  return `btn-base ${variantClass} ${sizeClass} ${className}`.trim();
}

export default function Button({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const finalClassName = resolveClassName(variant, size, className);

  if (to) {
    return (
      <Link className={finalClassName} to={to} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
}
