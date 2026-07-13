export default function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 text-slate-900 sm:px-6">
      <main className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kontabilist i Brendshëm</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          Faleminderit që keni zgjedhur të bëheni pjesë e këtij procesi. Ju urojmë shumë suksese!
        </p>

        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left sm:p-8">
          <h2 className="text-center text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Rregullat e testit
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-slate-700 marker:text-slate-400">
            <li>
              Testi zgjat <strong>45 minuta</strong> — koha fillon kur klikoni "Fillo testin".
            </li>
            <li>
              <strong>Hulumtimi është i lejuar</strong> (interneti, ligjet, ATK/ARBK) — por
              përgjigjet duhet të jenë tuajat.
            </li>
            <li>
              Një pyetje shfaqet në çdo hap; mund të ktheheni prapa dhe të ndryshoni përgjigjet
              derisa të skadojë koha.
            </li>
            <li>Përgjigjet ruhen automatikisht.</li>
          </ul>
        </section>

        <button
          type="button"
          onClick={onStart}
          className="mt-10 w-full rounded-lg bg-slate-900 px-10 py-4 text-base font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
        >
          Fillo testin
        </button>
      </main>
    </div>
  );
}
