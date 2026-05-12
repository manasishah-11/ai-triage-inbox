import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import Avatar from "@components/common/Avatar";
import { useDebounce } from "@hooks/useDebounce";
import { useInboxStore, type InboxItem } from "@store/useInboxStore";
import BadgeSelect from "@components/common/BadgeSelect";
import AiAssistPanel from "./AiAssistPanel";
import ChannelPill from "./ChannelPill";
import { AI_ASSIST_STATIC } from "./aiAssistStatic";
import {
  PRIORITY_OPTIONS,
  PRIORITY_STYLES,
  STATUS_OPTIONS,
  STATUS_STYLES,
} from "../../constants";
import { initialsFromName } from "../../utils";

function MessageDetails({ message }: { message: InboxItem }) {
  const updateMessageStatus = useInboxStore((s) => s.updateMessageStatus);
  const updateMessagePriority = useInboxStore((s) => s.updateMessagePriority);
  const updateMessageNotes = useInboxStore((s) => s.updateMessageNotes);

  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(() => message.notes ?? "");
  const debouncedNotes = useDebounce(notesDraft, 500);
  const notesDraftRef = useRef(notesDraft);

  useEffect(() => {
    notesDraftRef.current = notesDraft;
  }, [notesDraft]);

  useEffect(() => {
    updateMessageNotes(message.id, debouncedNotes);
  }, [message.id, debouncedNotes, updateMessageNotes]);

  useEffect(() => {
    const id = message.id;
    return () => updateMessageNotes(id, notesDraftRef.current);
  }, [message.id, updateMessageNotes]);

  const statusClass =
    message &&
    (STATUS_STYLES[message.status] ??
      "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30");
  const priorityClass =
    message &&
    (PRIORITY_STYLES[message.priority] ??
      "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30");

  return (
    <div className="space-y-6">
      <AiAssistPanel
        open={aiAssistOpen}
        onClose={() => setAiAssistOpen(false)}
        data={AI_ASSIST_STATIC}
      />
      <div className="rounded-xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <Avatar initials={initialsFromName(message.sender.name)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
                      {message.sender.name}
                    </div>
                    <a
                      href={`mailto:${message.sender.email}`}
                      className="mt-0 block truncate text-sm leading-snug text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      {message.sender.email}
                    </a>
                  </div>
                  <div className="shrink-0 text-right text-sm sm:hidden">
                    <div className="leading-4 font-medium text-slate-900 dark:text-slate-100">
                      {format(message.received_at, "MMM d, yyyy")}
                    </div>
                    <div className="leading-4 text-slate-500 dark:text-slate-400">
                      {format(message.received_at, "h:mm a")}
                    </div>
                  </div>
                </div>
                {(message.channel || (message.tags?.length ?? 0) > 0) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {message.channel ? (
                      <ChannelPill channel={message.channel} />
                    ) : null}
                    {message.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs text-slate-700 dark:bg-slate-700/90 dark:text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden shrink-0 text-sm sm:block sm:text-right">
              <div className="leading-4 font-medium text-slate-900 dark:text-slate-100">
                {format(message.received_at, "MMM d, yyyy")}
              </div>
              <div className="leading-4 text-slate-500 dark:text-slate-400">
                {format(message.received_at, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              {message.subject}
            </h1>
            <button
              type="button"
              onClick={() => setAiAssistOpen(true)}
              className="cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/25 dark:hover:bg-emerald-500/15"
            >
              <Sparkles className="size-4" strokeWidth={2} aria-hidden />
              AI assist
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {statusClass ? (
              <BadgeSelect
                id="detail-status"
                ariaLabel="Status"
                value={message.status}
                options={STATUS_OPTIONS}
                className={statusClass}
                onChange={(next) => updateMessageStatus(message.id, next)}
              />
            ) : null}
            {priorityClass ? (
              <BadgeSelect
                id="detail-priority"
                ariaLabel="Priority"
                value={message.priority}
                options={PRIORITY_OPTIONS}
                className={priorityClass}
                onChange={(next) => updateMessagePriority(message.id, next)}
              />
            ) : null}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {message.body}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
        <div className="px-5 py-5 sm:px-6">
          <label
            htmlFor="message-notes"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Notes
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal notes are saved as you type.
          </p>
          <textarea
            id="message-notes"
            rows={6}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Add context, next steps, or decisions for your team…"
            className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/15"
          />
        </div>
      </div>
    </div>
  );
}

export default MessageDetails;
