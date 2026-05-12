import { create } from "zustand";
import { loadMockInboxData } from "@lib/mockInboxNetwork";

export type InboxItem = {
  id: string;
  received_at: string;
  sender: { name: string; email: string };
  subject: string;
  status: "New" | "In Progress" | "Done" | (string & {});
  priority: "P1" | "P2" | "P3" | (string & {});
  body: string;
  notes?: string;
  channel?: string;
  tags?: string[];
};

export type InboxItemsLoadStatus = "idle" | "loading" | "ready" | "error";

type InboxState = {
  items: InboxItem[];
  itemsLoadStatus: InboxItemsLoadStatus;
  itemsLoadError: string | null;
  setItems: (items: InboxItem[]) => void;

  loadInboxItems: () => Promise<void>;
  updateMessageStatus: (id: string, status: string) => void;
  updateMessagePriority: (id: string, priority: string) => void;
  updateMessageNotes: (id: string, notes: string) => void;
  bulkUpdateMessageStatus: (ids: Set<string>, status: string) => void;
};

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  itemsLoadStatus: "idle",
  itemsLoadError: null,

  setItems: (items) =>
    set({ items, itemsLoadStatus: "ready", itemsLoadError: null }),
  loadInboxItems: async () => {
    const { items, itemsLoadStatus } = get();
    if (items.length > 0) return;
    if (itemsLoadStatus === "loading") return;
    set({ itemsLoadStatus: "loading", itemsLoadError: null });
    try {
      const next = (await loadMockInboxData()) as InboxItem[];
      set({
        items: next,
        itemsLoadStatus: "ready",
        itemsLoadError: null,
      });
    } catch (e) {
      set({
        itemsLoadStatus: "error",
        itemsLoadError:
          e instanceof Error ? e.message : "Failed to load inbox.",
      });
    }
  },
  updateMessageStatus: (id: string, status: string) => {
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    });
  },
  updateMessagePriority: (id: string, priority: string) => {
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, priority } : item,
      ),
    });
  },
  updateMessageNotes: (id: string, notes: string) => {
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, notes } : item,
      ),
    });
  },
  bulkUpdateMessageStatus: (ids: Set<string>, status: string) => {
    set({
      items: get().items.map((item) =>
        ids.has(item.id) ? { ...item, status } : item,
      ),
    });
  },
}));
