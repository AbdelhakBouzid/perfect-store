import { inputClassName } from "./Input";

export default function Select({ label, className = "", children, ...props }) {
  const selectElement = (
    <select className={inputClassName(className)} {...props}>
      {children}
    </select>
  );

  if (!label) return selectElement;

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      {selectElement}
    </label>
  );
}
