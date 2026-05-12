import { create } from "zustand";

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
};

type AiAssistDraftState = {
  draftOverrides: Record<string, string>;
  setDraftOverride: (messageId: string, draft: string) => void;
  clearDraftOverride: (messageId: string) => void;
};

export const useAiAssistDraftStore = create<AiAssistDraftState>((set) => ({
  draftOverrides: {},
  setDraftOverride: (messageId, draft) =>
    set((s) => ({
      draftOverrides: { ...s.draftOverrides, [messageId]: draft },
    })),
  clearDraftOverride: (messageId) =>
    set((s) => {
      const next = { ...s.draftOverrides };
      delete next[messageId];
      return { draftOverrides: next };
    }),
}));
