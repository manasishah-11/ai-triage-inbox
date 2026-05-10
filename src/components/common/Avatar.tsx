function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100 ring-1 ring-slate-700"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default Avatar;
