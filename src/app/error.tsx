'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh px-4">
      <div className="text-center max-w-md glass-card p-8 rounded-2xl animate-fade-up">
        <p className="text-5xl font-bold text-gradient">Error</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-slate-600 dark:text-violet-300/60 text-sm">{error.message}</p>
        <button onClick={reset} className="btn-primary mt-6 px-5 py-2.5">
          Try again
        </button>
      </div>
    </div>
  );
}
