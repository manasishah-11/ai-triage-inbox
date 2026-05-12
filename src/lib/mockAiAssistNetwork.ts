import { buildAiAssistLoadPayload, type AiAssistLoadPayload } from "./aiAssistMockLoad";
import { validateAiAssistRecord } from "./aiAssistValidation";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function randomIntInclusive(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** ~10–15% chance to return a corrupted / invalid response instead of the mock row. */
function shouldSimulateBadOutput(): boolean {
  const rate = 0.1 + Math.random() * 0.05;
  return Math.random() < rate;
}

function payloadFromRawString(rawJson: string): AiAssistLoadPayload {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    return { rawJson, result: validateAiAssistRecord(parsed) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      rawJson,
      result: {
        ok: false,
        errors: [{ path: "", message: `Invalid JSON: ${msg}` }],
      },
    };
  }
}

/**
 * Random malformed payloads (as if the model or transport returned garbage).
 */
function randomBadPayload(messageId: string): AiAssistLoadPayload {
  const roll = Math.random();

  if (roll < 0.22) {
    const snippets = [
      '{"summary_bullets": [',
      '{ "id": "x", "category": Billing }',
      '{"trailing": true,}',
      "not json at all — model hallucination",
      "",
      "{",
    ];
    const rawJson = snippets[randomIntInclusive(0, snippets.length - 1)];
    return payloadFromRawString(rawJson);
  }

  if (roll < 0.4) {
    const roots: string[] = [
      JSON.stringify(["array", "root", "instead", "of", "object"]),
      JSON.stringify(null),
      JSON.stringify("model returned a plain string"),
      JSON.stringify(42),
    ];
    const rawJson = roots[randomIntInclusive(0, roots.length - 1)];
    return payloadFromRawString(rawJson);
  }

  if (roll < 0.62) {
    const badObjects: unknown[] = [
      {
        id: messageId,
        summary_bullets: [],
        category: "General",
        priority: "",
        suggested_action: "",
        draft_reply: "",
      },
      {
        id: messageId,
        summary_bullets: ["ok"],
        category: "NotARealCategory",
        priority: "",
        suggested_action: "",
        draft_reply: "",
      },
      {
        id: messageId,
        summary_bullets: "not an array",
        category: "General",
        priority: "",
        suggested_action: "",
        draft_reply: "",
      },
      {
        id: 12345,
        summary_bullets: ["x"],
        category: "General",
        priority: "",
        suggested_action: "",
        draft_reply: "",
      },
    ];
    const obj = badObjects[randomIntInclusive(0, badObjects.length - 1)];
    const rawJson = JSON.stringify(obj, null, 2);
    return { rawJson, result: validateAiAssistRecord(obj) };
  }

  const almost = {
    id: messageId,
    summary_bullets: ["Looks fine"],
    category: "General",
    priority: "",
    suggested_action: "",
    draft_reply: "",
    confidence: 1.5,
  };
  const rawJson = JSON.stringify(almost, null, 2);
  return { rawJson, result: validateAiAssistRecord(almost) };
}

/**
 * Simulates AI assist over the wire: 200–1200ms latency and ~10–15% bad outputs
 * (invalid JSON, wrong root type, or schema violations).
 */
export async function fetchSimulatedAiAssistLoad(
  messageId: string,
): Promise<AiAssistLoadPayload> {
  const latencyMs = randomIntInclusive(200, 1200);
  await delay(latencyMs);
  if (shouldSimulateBadOutput()) {
    return randomBadPayload(messageId);
  }
  return buildAiAssistLoadPayload(messageId);
}
