export function inputClassName(extraClassName = "") {
  return `surface-field ${extraClassName}`.trim();
}

export default function Input({ label, className = "", ...props }) {
  const inputElement = <input className={inputClassName(className)} {...props} />;

  if (!label) return inputElement;

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-white/90">
      <span>{label}</span>
      {inputElement}
    </label>
  );
}
