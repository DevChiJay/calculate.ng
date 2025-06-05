export function Sidebar() {
  return (
    <aside className="hidden border-r bg-background md:block w-[240px] shrink-0" aria-label="Sidebar">
      <div className="flex h-full flex-col py-6">
        <div className="px-4 py-2">
          <h2 className="mb-3 px-3 text-lg font-bold tracking-tight" id="calculators-heading">Calculators</h2>
          <div className="space-y-2" role="navigation" aria-labelledby="calculators-heading">
            <Navigation />
          </div>
        </div>
      </div>
    </aside>
  );
}

import { Navigation } from "./navigation";
