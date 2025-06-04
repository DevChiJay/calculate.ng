export function Sidebar() {
  return (
    <div className="hidden border-r bg-background md:block w-[240px] shrink-0">
      <div className="flex h-full flex-col py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Calculators</h2>
          <div className="space-y-1">
            <Navigation />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Navigation } from "./navigation";
