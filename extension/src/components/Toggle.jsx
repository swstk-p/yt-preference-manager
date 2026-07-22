export default function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white"> {label} </h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {" "}
            {description}{" "}
          </p>
        )}{" "}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-red-500
          ${checked ? "bg-red-600" : "bg-zinc-700"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}>
        <span
          className={`
            inline-block h-5 w-5 rounded-full bg-white shadow
            transition-transform duration-200 mt-0.5
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />{" "}
      </button>{" "}
    </div>
  );
}
