import Image from "next/image";
import Link from "next/link";
import { Github, Mail, Phone, Twitter } from "lucide-react";
import { calculatorGroups, site } from "@/lib/site";

/** Server component: the year is computed at build time, so there is no client JS for it. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const iconLink =
    "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr_1fr]">
          <div>
            <Image src="/logo.svg" width={120} height={40} alt="Calculate.ng" className="h-10 w-auto" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Free Nigerian calculators with the workings shown. Estimates for information only.
            </p>
          </div>

          <nav aria-label="Calculators">
            <h2 className="text-sm font-semibold">Calculators</h2>
            <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-3">
              {calculatorGroups.map((g) => (
                <div key={g.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{g.name}</p>
                  <ul className="mt-1">
                    {g.items.map((c) => (
                      <li key={c.path}>
                        <Link
                          href={c.path}
                          className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link
              href="/calculators"
              className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              All calculators
            </Link>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="inline-flex min-h-11 items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Mail className="size-4" aria-hidden /> {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phoneHref}`}
                  className="inline-flex min-h-11 items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Phone className="size-4" aria-hidden /> {site.contact.phone}
                </a>
              </li>
            </ul>
            <div className="mt-2 flex gap-1">
              <a href={site.social.github} className={iconLink} aria-label="Devchi Digital on GitHub (opens in a new tab)" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" aria-hidden />
              </a>
              <a href={site.social.x} className={iconLink} aria-label="Devchi Digital on X (opens in a new tab)" target="_blank" rel="noopener noreferrer">
                <Twitter className="size-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built by{" "}
            <a
              href={site.owner.url}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {site.owner.name}
            </a>
            . © {year}
          </p>
          <p>Results are estimates, not tax, financial or medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
