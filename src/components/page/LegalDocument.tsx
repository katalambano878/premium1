import { PageHero } from "@/components/page/PageHero";

export function LegalDocument({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { title: string; paragraphs: string[] }[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated: ${updated}`} />
      <section className="px-3 py-12 sm:px-6 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-slate-200 bg-white px-5 py-8 sm:space-y-12 sm:p-10 lg:p-14">
          {sections.map((sec) => (
            <section key={sec.title}>
              <h2 className="text-2xl font-medium tracking-[-0.02em] text-[var(--navy)]">{sec.title}</h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-slate-700 sm:text-lg sm:leading-8">
                {sec.paragraphs.map((p) => (
                  <p key={p.slice(0, 50)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </section>
    </>
  );
}
