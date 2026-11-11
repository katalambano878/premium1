const industries = ["Mining", "FMCG & Retail", "Manufacturing", "NGOs & Aid", "Healthcare", "E-commerce"];

export function IndustriesStrip() {
  return (
    <section className="px-3 pb-6 sm:px-5">
      <div className="mx-auto max-w-[1480px] rounded-3xl border border-slate-200 bg-white px-6 py-6 sm:px-10">
        <p className="text-center text-[13px] text-slate-500 lg:hidden">Industries we work with</p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 lg:mt-0 lg:justify-between">
          {industries.map((name) => (
            <li key={name} className="text-lg font-bold tracking-[-0.02em] text-slate-400 sm:text-xl">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
