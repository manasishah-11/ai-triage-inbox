import { create } from "zustand";
import { loadMockAiAssistData } from "@mocks/mockNetwork";
import mockAiAssistData from "@mocks/mockAiAssistData.json";

export type AiAssistData = {
  id: string;
  summary_bullets: string[];
  category:
    | "Billing"
    | "Claims"
    | "Endorsement"
    | "General"
    | "Urgent"
    | "Spam";
  priority: string;
  suggested_action: string;
  draft_reply: string;
  confidence?: number;
  draft_reply_edited?: boolean;
};

export type AiAssistLoadStatus = "idle" | "loading" | "ready" | "error";

type AiAssistCacheState = {
  byId: Record<string, AiAssistData>;
  loadStatusById: Record<string, AiAssistLoadStatus>;
  loadErrorById: Record<string, string | null>;

  loadData: (id: string, force?: boolean) => Promise<void>;
  updateDraftReplyUser: (id: string, reply: string) => void;
  resetDraftReply: (id: string) => void;
};

export const useAiAssistCacheStore = create<AiAssistCacheState>((set, get) => ({
  byId: {},
  loadStatusById: {},
  loadErrorById: {},

  loadData: async (id: string, force: boolean = false) => {
    const { byId, loadStatusById } = get();
    if (byId[id] != null && !force) return;

    const status = force ? "idle" : (loadStatusById[id] ?? "idle");
    if (status === "loading") return;

    set((s) => ({
      loadStatusById: { ...s.loadStatusById, [id]: "loading" },
      loadErrorById: { ...s.loadErrorById, [id]: null },
    }));

    const data = await loadMockAiAssistData(id);
    if (data.kind === "ok") {
      set((s) => ({
        byId: { ...s.byId, [id]: data.data },
        loadStatusById: { ...s.loadStatusById, [id]: "ready" },
        loadErrorById: { ...s.loadErrorById, [id]: null },
      }));
    } else {
      set((s) => ({
        loadStatusById: { ...s.loadStatusById, [id]: "error" },
        loadErrorById: {
          ...s.loadErrorById,
          [id]:
            data.kind === "invalid_json"
              ? data.rawJson
              : "Failed to load AI assist data.",
        },
      }));
    }
  },
  updateDraftReplyUser: (id: string, reply: string) => {
    set((s) => ({
      byId: {
        ...s.byId,
        [id]: { ...s.byId[id], draft_reply: reply, draft_reply_edited: true },
      },
    }));
  },
  resetDraftReply: (id: string) => {
    set((s) => {
      const data = mockAiAssistData.find((data) => data.id === id);
      if (!data) return s;
      return {
        byId: {
          ...s.byId,
          [id]: {
            ...s.byId[id],
            draft_reply: data.draft_reply ?? "",
            draft_reply_edited: false,
          },
        },
      };
    });
  },
}));
