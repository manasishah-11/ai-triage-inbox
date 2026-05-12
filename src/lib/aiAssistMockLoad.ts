import mockAiAssistData from "@mocks/mockAiAssistData.json";
import {
  validateAiAssistRecord,
  type AiAssistValidationResult,
} from "./aiAssistValidation";

function fallbackRecord(messageId: string): unknown {
  return {
    id: messageId,
    summary_bullets: ["No AI assist entry for this message."],
    category: "General",
    priority: "",
    suggested_action: "",
    draft_reply: "",
  };
}

export type AiAssistLoadPayload = {
  rawJson: string;
  result: AiAssistValidationResult;
};

/**
 * Builds payload from static mock data (no latency / no simulated corruption).
 * Missing mock rows still yield a small JSON notice while validating a safe fallback object.
 */
export function buildAiAssistLoadPayload(messageId: string): AiAssistLoadPayload {
  const rows = mockAiAssistData as unknown[];
  const row = rows.find(
    (r) =>
      typeof r === "object" &&
      r !== null &&
      !Array.isArray(r) &&
      "id" in r &&
      (r as { id: string }).id === messageId,
  );

  if (!row) {
    const envelope = { _notice: "no_mock_row", messageId };
    const parsed = fallbackRecord(messageId);
    const rawJson =
      JSON.stringify(
        { envelope, fallback: parsed },
        null,
        2,
      );
    return { rawJson, result: validateAiAssistRecord(parsed) };
  }

  const parsed: unknown = JSON.parse(JSON.stringify(row));
  const rawJson = JSON.stringify(parsed, null, 2);
  return { rawJson, result: validateAiAssistRecord(parsed) };
}

export const loadAiAssistFromMock = buildAiAssistLoadPayload;
