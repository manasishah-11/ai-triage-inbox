// Splits `text` on the (case-insensitive) `query` and wraps every matching
// segment in <mark>. Regex special characters in `query` are escaped so they
// match literally. When `query` is empty/whitespace, the original text is
// returned untouched.
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  const qLower = q.toLowerCase();

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === qLower ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-300/60 px-0.5 text-inherit dark:bg-yellow-400/30"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default Highlight;
