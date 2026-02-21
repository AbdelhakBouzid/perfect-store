import { Link } from "react-router-dom";

const VARIANT_STYLES = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger:
    "border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200 dark:border-rose-700 dark:bg-rose-900/50 dark:text-rose-200 dark:hover:bg-rose-900/70"
};

const SIZE_STYLES = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm sm:text-base"
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
