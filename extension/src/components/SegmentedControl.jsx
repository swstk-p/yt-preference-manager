export default function SegmentedControl({
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white"> {label} </h3>
        {description && (
          <p className="mt-1 text-xs text-zinc-500 leading-5">
            {" "}
            {description}{" "}
          </p>
        )}{" "}
      </div>
      <div className="flex w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
        {" "}
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`
              flex-1
              py-2
              text-sm
              transition-colors
              border-r
              last:border-r-0
              border-zinc-700
              ${
                value === option.value
                  ? "bg-red-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}>
            {option.label}{" "}
          </button>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
