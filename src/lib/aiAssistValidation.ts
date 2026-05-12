import type { AiAssistData } from "@store/useAiAssistDraftStore";

const CATEGORIES: readonly AiAssistData["category"][] = [
  "Billing",
  "Claims",
  "Endorsement",
  "General",
  "Urgent",
  "Spam",
] as const;

export type AiAssistValidationError = {
  path: string;
  message: string;
};

export type AiAssistValidationResult =
  | { ok: true; data: AiAssistData }
  | { ok: false; errors: AiAssistValidationError[] };

export function validationErrorsFromResult(
  result: AiAssistValidationResult,
): AiAssistValidationError[] {
  if (result.ok === false) return result.errors;
  return [];
}

function isCategory(v: string): v is AiAssistData["category"] {
  return (CATEGORIES as readonly string[]).includes(v);
}

export function validateAiAssistRecord(raw: unknown): AiAssistValidationResult {
  const errors: AiAssistValidationError[] = [];

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      errors: [{ path: "", message: "Root value must be a JSON object" }],
    };
  }

  const o = raw as Record<string, unknown>;

  if (typeof o.id !== "string") {
    errors.push({ path: "id", message: "Must be a string" });
  }

  if (!Array.isArray(o.summary_bullets)) {
    errors.push({ path: "summary_bullets", message: "Must be an array" });
  } else if (o.summary_bullets.length < 1) {
    errors.push({
      path: "summary_bullets",
      message: "Must contain at least one bullet string",
    });
  } else if (!o.summary_bullets.every((x) => typeof x === "string")) {
    errors.push({
      path: "summary_bullets",
      message: "Each item must be a string",
    });
  }

  if (typeof o.category !== "string" || !isCategory(o.category)) {
    errors.push({
      path: "category",
      message: `Must be one of: ${CATEGORIES.join(", ")}`,
    });
  }

  if (typeof o.priority !== "string") {
    errors.push({ path: "priority", message: "Must be a string" });
  }

  if (typeof o.suggested_action !== "string") {
    errors.push({ path: "suggested_action", message: "Must be a string" });
  }

  if (typeof o.draft_reply !== "string") {
    errors.push({ path: "draft_reply", message: "Must be a string" });
  }

  if (o.confidence !== undefined) {
    if (typeof o.confidence !== "number" || Number.isNaN(o.confidence)) {
      errors.push({ path: "confidence", message: "Must be a number" });
    } else if (o.confidence < 0 || o.confidence > 1) {
      errors.push({
        path: "confidence",
        message: "Must be between 0 and 1 inclusive",
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const data: AiAssistData = {
    id: o.id as string,
    summary_bullets: o.summary_bullets as string[],
    category: o.category as AiAssistData["category"],
    priority: o.priority as string,
    suggested_action: o.suggested_action as string,
    draft_reply: o.draft_reply as string,
    confidence:
      typeof o.confidence === "number" && !Number.isNaN(o.confidence)
        ? o.confidence
        : undefined,
  };

  return { ok: true, data };
}
