import { create } from "zustand";

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

type InboxState = {
  items: InboxItem[];
  setItems: (items: InboxItem[]) => void;
  updateMessageStatus: (id: string, status: string) => void;
  updateMessagePriority: (id: string, priority: string) => void;
  updateMessageNotes: (id: string, notes: string) => void;
  bulkUpdateMessageStatus: (ids: Set<string>, status: string) => void;
};

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
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
