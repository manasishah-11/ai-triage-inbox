import { ChevronDown, type LucideIcon } from "lucide-react";

type FilterOption = {
  value: string;
  label: string;
};

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  icon: Icon,
  showValue = false,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
  showValue?: boolean;
}) {
  const selected = options.find((o) => o.value === value);
  const displayText = showValue && selected ? selected.label : label;

  return (
    <div className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white text-sm text-slate-900 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-400/40 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-within:ring-slate-500/40">
      <div className="pointer-events-none flex items-center gap-2 py-2 pr-9 pl-4">
        {Icon ? (
          <Icon
            className="h-4 w-4 text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          />
        ) : null}
        <span className="whitespace-nowrap">{displayText}</span>
      </div>
      <ChevronDown
        className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent text-transparent opacity-0 focus:outline-none"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterSelect;
