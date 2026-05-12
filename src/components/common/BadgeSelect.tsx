import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import Badge from "./Badge";

function optionsWithCurrent(
  value: string,
  opts: readonly { value: string; label: string }[],
) {
  if (opts.some((o) => o.value === value)) return [...opts];
  return [{ value, label: value }, ...opts];
}

/** Pill UI from `Badge` with a chevron; invisible native `<select>` on top for choice + a11y. */
function BadgeSelect({
  id,
  ariaLabel,
  value,
  options,
  className,
  onChange,
}: {
  id: string;
  ariaLabel: string;
  value: string;
  options: readonly { value: string; label: string }[];
  className: string;
  onChange: (next: string) => void;
}) {
  const merged = useMemo(
    () => optionsWithCurrent(value, options),
    [value, options],
  );

  return (
    <div className="relative inline-flex max-w-full align-middle">
      <div className="pointer-events-none" aria-hidden="true">
        <Badge
          label={value}
          className={className}
          suffix={
            <ChevronDown
              className="size-3.5 shrink-0 opacity-70"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          }
        />
      </div>
      <select
        id={id}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full min-h-7 w-full cursor-pointer appearance-none rounded-full border-0 bg-transparent text-transparent opacity-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500/50 dark:focus-visible:ring-offset-slate-950"
      >
        {merged.map((opt) => (
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

export default BadgeSelect;
