import { Eyebrow } from "@/components/ui/eyebrow";

/** The single H1 for a page, with an eyebrow and a short lede. Server-rendered. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <header className="mb-8 max-w-3xl">
      <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
      <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{children}</p>
    </header>
  );
}
