import T from '@/app/components/T';

export default function ImportDetailEmpty() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-slate-100">
      <h2 className="text-lg font-semibold">
        <T ns="imports.detail.empty" id="title" />
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        <T ns="imports.detail.empty" id="description" />
      </p>
      <button className="mt-6 rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
        <T ns="imports.detail.empty" id="cta" />
      </button>
    </div>
  );
}
