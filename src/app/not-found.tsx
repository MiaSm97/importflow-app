import Link from 'next/link';
import NotFoundIcon from './components/ui/icons/NotFoundIcon';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <NotFoundIcon />
        </div>
        <div className="mb-2 text-sm font-semibold tracking-widest text-gray-400">
          404
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-900"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
