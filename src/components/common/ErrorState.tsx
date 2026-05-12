function ErrorState({
  errorTitle,
  errorMessage,
  onRetry,
}: {
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 p-8">
      <p className="text-center text-sm font-medium text-rose-900 dark:text-rose-100">
        {errorTitle}
      </p>
      <p className="max-w-md text-center text-sm text-rose-800/90 dark:text-rose-200/85">
        {errorMessage ?? "Unknown error."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500"
      >
        Retry
      </button>
    </div>
  );
}

export default ErrorState;
