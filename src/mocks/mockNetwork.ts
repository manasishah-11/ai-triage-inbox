import mockInboxData from "@mocks/mockInboxData.json";
import mockAiAssistData from "@mocks/mockAiAssistData.json";
import type { AiAssistData } from "@store/useAiAssistCacheStore";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Inclusive random integer in [min, max]. */
function randomIntInclusive(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Random failure rate between 10% and 15% (exclusive of upper bound uses < p each draw;
 * we draw p once per request so the realized failure rate varies slightly per request).
 */
export function shouldSimulateFailure(): boolean {
  const failureRate = 0.1 + Math.random() * 0.05;
  return Math.random() < failureRate;
}

/**
 * Simulates fetching inbox data: latency 200–1200ms and occasional network failure (~10–15%).
 */
export async function loadMockInboxData(): Promise<typeof mockInboxData> {
  const latencyMs = randomIntInclusive(200, 1200);
  await delay(latencyMs);
  if (shouldSimulateFailure()) {
    throw new Error("Simulated network failure while loading inbox.");
  }
  return mockInboxData;
}

/**
 * Simulates fetching ai assist data: latency 200–1200ms and occasional network failure (~10–15%).
 */
export type LoadMockAiAssistResult =
  | { kind: "ok"; data: AiAssistData }
  | {
      kind: "invalid_json";
      rawJson: string;
    };

export async function loadMockAiAssistData(
  id: string,
): Promise<LoadMockAiAssistResult> {
  const data = mockAiAssistData.find((d) => d.id === id);
  if (!data) {
    throw new Error(`AI assist data not found for id: ${id}`);
  }

  const latencyMs = randomIntInclusive(200, 1200);
  await delay(latencyMs);

  if (shouldSimulateFailure()) {
    // Syntactically invalid JSON (truncated object, bad token, etc.)
    const rawJson = `{"id":${JSON.stringify(id)},"summary_bullets":[]}`;
    return { kind: "invalid_json", rawJson };
  }

  return { kind: "ok", data: data as AiAssistData };
}
