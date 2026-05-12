import { Loader2 } from "lucide-react";

function LoadingState({
  loadingTitle,
  loadingMessage,
}: {
  loadingTitle: string;
  loadingMessage: string;
}) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 p-8 text-sm text-slate-600 dark:text-slate-300">
      <Loader2
        className="size-8 animate-spin text-emerald-600 dark:text-emerald-400"
        strokeWidth={2}
        aria-hidden
      />
      <p className="text-center font-medium text-slate-800 dark:text-slate-100">
        {loadingTitle}
      </p>
      <p className="max-w-sm text-center text-xs text-slate-500 dark:text-slate-400">
        {loadingMessage}
      </p>
    </div>
  );
}

export default LoadingState;
