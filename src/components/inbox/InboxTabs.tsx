import { useCallback, useMemo, useState } from "react";
import { Mail, MessageSquare, Radio, type LucideIcon } from "lucide-react";
import {
  useInboxStore,
  type InboxItem as InboxItemType,
} from "@store/useInboxStore";
import InboxTabItem from "./InboxTabItem";
import InboxList from "./InboxList";

/** Canonical key for grouping (trimmed, lowercased); empty / missing → "email". */
function inboxChannelKey(item: InboxItemType): string {
  const raw = (item.channel ?? "").trim().toLowerCase();
  return raw.length > 0 ? raw : "email";
}

const PREFERRED_CHANNEL_ORDER = ["email", "chat"];

function sortChannelKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ai = PREFERRED_CHANNEL_ORDER.indexOf(a);
    const bi = PREFERRED_CHANNEL_ORDER.indexOf(b);
    const ar = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const br = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (ar !== br) return ar - br;
    return a.localeCompare(b);
  });
}

function channelLabelForKey(key: string): string {
  if (!key) return "All";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function iconForChannelKey(key: string): LucideIcon {
  if (key === "email" || key.includes("mail")) return Mail;
  if (key === "chat" || key.includes("chat")) return MessageSquare;
  return Radio;
}

function InboxTabs({ items }: { items: InboxItemType[] }) {
  const itemsLoadStatus = useInboxStore((s) => s.itemsLoadStatus);

  const [channelTab, setChannelTab] = useState<string>("email");

  const channelBuckets = useMemo(() => {
    const map = new Map<string, InboxItemType[]>();
    for (const m of items) {
      const key = inboxChannelKey(m);
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    const keys = sortChannelKeys([...map.keys()]);
    return { map, keys };
  }, [items]);

  const activeChannelKey = useMemo(() => {
    const { keys } = channelBuckets;
    if (keys.length === 0) return channelTab;
    if (keys.includes(channelTab)) return channelTab;
    return keys[0];
  }, [channelBuckets, channelTab]);

  const itemsForChannel = useMemo(
    () => channelBuckets.map.get(activeChannelKey) ?? [],
    [channelBuckets, activeChannelKey],
  );

  const handleTabSelect = useCallback((key: string) => {
    setChannelTab(key);
  }, []);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <div className="shrink-0 bg-slate-50/80 py-6 backdrop-blur dark:bg-slate-950/80">
          <div className="text-2xl font-semibold tracking-tight">
            AI Triage Inbox
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {items.length === 0 && itemsLoadStatus === "error"
              ? "Could not load messages"
              : items.length === 0 &&
                  (itemsLoadStatus === "loading" || itemsLoadStatus === "idle")
                ? "Loading messages…"
                : `${items.length} messages`}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6 sm:flex-row sm:gap-6">
          <nav
            aria-label="Channels"
            className="flex shrink-0 flex-row gap-2 sm:w-48 sm:flex-col rounded-xl border border-slate-200 sm:bg-slate-100/50 sm:py-4 sm:px-3 dark:border-slate-800 dark:sm:bg-slate-900/40"
          >
            <div className="hidden text-xs font-medium tracking-wide text-slate-500 uppercase sm:block dark:text-slate-400">
              Channels
            </div>
            <div className="flex min-w-0 flex-1 flex-row gap-2 sm:flex-col sm:gap-1">
              {channelBuckets.keys.map((key) => (
                <InboxTabItem
                  key={key}
                  keyLabel={key}
                  label={channelLabelForKey(key)}
                  count={channelBuckets.map.get(key)?.length ?? 0}
                  Icon={iconForChannelKey(key)}
                  selected={activeChannelKey === key}
                  onSelect={handleTabSelect}
                />
              ))}
            </div>
          </nav>

          <InboxList key={activeChannelKey} items={itemsForChannel} />
        </div>
      </div>
    </div>
  );
}

export default InboxTabs;
