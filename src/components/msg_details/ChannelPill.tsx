import { Mail, MessageSquare, Radio } from "lucide-react";

const channelIconClass = "size-3.5 shrink-0 text-slate-500 dark:text-slate-400";

function ChannelPill({ channel }: { channel: string }) {
  const c = channel.toLowerCase();
  const glyph =
    c === "email" || c.includes("mail") ? (
      <Mail className={channelIconClass} strokeWidth={2} aria-hidden />
    ) : c === "chat" || c.includes("chat") ? (
      <MessageSquare className={channelIconClass} strokeWidth={2} aria-hidden />
    ) : (
      <Radio className={channelIconClass} strokeWidth={2} aria-hidden />
    );

  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:shadow-none"
      title="Channel"
    >
      {glyph}
      <span className="sr-only">Channel: </span>
      <span className="font-medium capitalize text-slate-800 dark:text-slate-100">
        {channel}
      </span>
    </span>
  );
}

export default ChannelPill;
