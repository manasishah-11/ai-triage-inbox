import { format } from "date-fns";
import Avatar from "@components/common/Avatar";
import Badge from "@components/common/Badge";
import Highlight from "@components/common/Highlight";
import { bodyPreviewLines, initialsFromName } from "../../utils";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-500/12 text-blue-800 ring-blue-500/25 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30",
  "In Progress":
    "bg-amber-500/12 text-amber-900 ring-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  Done: "bg-emerald-500/12 text-emerald-800 ring-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  P1: "bg-rose-500/12 text-rose-800 ring-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
  P2: "bg-violet-500/12 text-violet-800 ring-violet-500/25 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30",
  P3: "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30",
};

function InboxItem({
  senderName,
  senderEmail,
  subject,
  body,
  status,
  priority,
  receivedAt,
  searchQuery = "",
}: {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  receivedAt: string;
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
    <li className="px-4 py-4 hover:bg-slate-100/90 dark:hover:bg-slate-900/50">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_3.6fr_0.75fr] sm:items-start">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start sm:pt-0.5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar initials={initialsFromName(senderName)} />
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
