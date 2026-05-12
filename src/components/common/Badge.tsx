import type { ReactNode } from "react";

function Badge({
  label,
  className,
  suffix,
}: {
  label: string;
  className: string;
  suffix?: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full py-0.5 text-xs font-medium ring-1 ring-inset",
        suffix ? "gap-1 pr-1.5 pl-2" : "px-2",
        className,
      ].join(" ")}
    >
      {suffix ? <span className="min-w-0 truncate">{label}</span> : label}
      {suffix}
    </span>
  );
}

export default Badge;
