export function bodyPreviewLines(body: string) {
  const normalized = body.replaceAll("\\n", "\n").replaceAll("/n", "\n");
  return normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
