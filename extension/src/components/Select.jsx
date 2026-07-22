export default function Select({
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white"> {label} </h3>{" "}
        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {" "}
            {description}{" "}
          </p>
        )}{" "}
      </div>{" "}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ">
        {" "}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-zinc-900 text-white">
            {" "}
            {option.label}{" "}
          </option>
        ))}{" "}
      </select>{" "}
    </div>
  );
}
