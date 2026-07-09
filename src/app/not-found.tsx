import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh px-4 relative overflow-hidden">
      <div className="brand-blob w-64 h-64 bg-violet-500 top-20 left-1/4 animate-float" />
      <div className="text-center relative animate-fade-up">
        <p className="text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-slate-600 dark:text-violet-300/60">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-block mt-6 px-5 py-2.5">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
