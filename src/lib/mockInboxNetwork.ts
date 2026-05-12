import mockInboxData from "@mocks/mockInboxData.json";

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
function shouldSimulateFailure(): boolean {
  const failureRate = 0.1 + Math.random() * 0.05;
  return Math.random() < failureRate;
}

/**
 * Simulates fetching inbox data: latency 200–1200ms and occasional network failure (~10–15%).
 */
export async function loadMockInboxData(): Promise<
  typeof mockInboxData
> {
  const latencyMs = randomIntInclusive(200, 1200);
  await delay(latencyMs);
  if (shouldSimulateFailure()) {
    throw new Error("Simulated network failure while loading inbox.");
  }
  return mockInboxData;
}
