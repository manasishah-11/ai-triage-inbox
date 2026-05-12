import { format } from "date-fns";
import { Check } from "lucide-react";
import Avatar from "@components/common/Avatar";
import Badge from "@components/common/Badge";
import Highlight from "@components/common/Highlight";
import { bodyPreviewLines, initialsFromName } from "../../utils";
import { STATUS_STYLES, PRIORITY_STYLES } from "../../constants";

function InboxItem({
  id,
  senderName,
  senderEmail,
  subject,
  body,
  status,
  priority,
  receivedAt,
  selected,
  onToggleSelect,
  onOpenDetail,
  searchQuery = "",
}: {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  receivedAt: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  searchQuery?: string;
}) {
  const statusClass =
    STATUS_STYLES[status] ??
    "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30";
  const priorityClass =
    PRIORITY_STYLES[priority] ??
    "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30";

  const dateTime = (
    <>
      <div className="leading-4">{format(receivedAt, "MMM dd, yyyy")}</div>
      <div className="leading-4 text-slate-500 dark:text-slate-400">
        {format(receivedAt, "hh:mm a")}
      </div>
    </>
  );

  return (
    <li
      className={`cursor-pointer px-4 py-4 hover:bg-slate-100/90 dark:hover:bg-slate-900/50 ${selected ? "bg-slate-100/95 dark:bg-slate-900/70" : ""}`}
      onClick={() => onOpenDetail(id)}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_3.6fr_0.75fr] sm:items-start">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start sm:pt-0.5">
          <div className="flex min-w-0 items-center gap-3">
            <label
              className="relative shrink-0 cursor-pointer rounded-full outline-none has-focus-visible:ring-2 has-focus-visible:ring-slate-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-slate-50 dark:has-focus-visible:ring-offset-slate-950"
              title={senderEmail}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Select message from {senderName}</span>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(id)}
                className="sr-only"
              />
              {selected ? (
                <span className="grid size-9 place-items-center rounded-full border border-emerald-600 bg-emerald-500/15 ring-1 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-500/20 dark:ring-emerald-500/40">
                  <Check
                    className="size-4 text-emerald-700 dark:text-emerald-300"
                    aria-hidden="true"
                    strokeWidth={2.5}
                  />
                </span>
              ) : (
                <Avatar initials={initialsFromName(senderName)} />
              )}
            </label>
            <div className="min-w-0">
              <div
                className="truncate text-sm font-medium text-slate-900 dark:text-slate-100"
                title={senderEmail}
              >
                <Highlight text={senderName} query={searchQuery} />
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-slate-600 dark:text-slate-300 sm:hidden">
            {dateTime}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-block min-w-0 max-w-[calc(100%-9rem)] truncate align-middle text-sm text-slate-900 dark:text-slate-100">
              <Highlight text={subject} query={searchQuery} />
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 align-middle">
              <Badge label={status} className={statusClass} />
              <Badge label={priority} className={priorityClass} />
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            {bodyPreviewLines(body).map((line, i) => (
              <div
                key={i}
                className="truncate text-xs text-slate-600 dark:text-slate-400"
              >
                <Highlight text={line} query={searchQuery} />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden text-xs text-slate-600 dark:text-slate-300 sm:block sm:pt-0.5 sm:text-right">
          {dateTime}
        </div>
      </div>
    </li>
  );
}

export default InboxItem;
