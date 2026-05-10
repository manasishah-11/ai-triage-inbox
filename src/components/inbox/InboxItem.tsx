import { format } from "date-fns";
import Avatar from "@components/common/Avatar";
import Badge from "@components/common/Badge";
import { bodyPreviewLines, initialsFromName } from "../../utils";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-500/15 text-blue-200 ring-blue-500/30",
  "In Progress": "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  Done: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  P1: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
  P2: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
  P3: "bg-slate-500/15 text-slate-200 ring-slate-400/30",
};

function InboxItem({
  senderName,
  senderEmail,
  subject,
  body,
  status,
  priority,
  receivedAt,
}: {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  receivedAt: string;
}) {
  const statusClass =
    STATUS_STYLES[status] ?? "bg-slate-500/15 text-slate-200 ring-slate-400/30";
  const priorityClass =
    PRIORITY_STYLES[priority] ??
    "bg-slate-500/15 text-slate-200 ring-slate-400/30";

  return (
    <li className="px-4 py-4 hover:bg-slate-900/50">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_3.6fr_0.75fr] sm:items-start">
        <div className="flex min-w-0 items-center gap-3 sm:pt-0.5">
          <Avatar initials={initialsFromName(senderName)} />
          <div className="min-w-0">
            <div
              className="truncate text-sm font-medium text-slate-100"
              title={senderEmail}
            >
              {senderName}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-block min-w-0 max-w-[calc(100%-9rem)] truncate align-middle text-sm text-slate-100">
              {subject}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 align-middle">
              <Badge label={status} className={statusClass} />
              <Badge label={priority} className={priorityClass} />
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            {bodyPreviewLines(body).map((line, i) => (
              <div key={i} className="truncate text-xs text-slate-400">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-300 sm:pt-0.5 sm:text-right">
          <div className="leading-4">{format(receivedAt, "MMM dd, yyyy")}</div>
          <div className="leading-4 text-slate-400">
            {format(receivedAt, "hh:mm a")}
          </div>
        </div>
      </div>
    </li>
  );
}

export default InboxItem;
