function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default Badge;
