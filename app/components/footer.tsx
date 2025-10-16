import Logo from "@/components/Logo";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8 sm:h-10 sm:w-10 mr-2 drop-shadow-lg" />
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400"
            >
              <a
                href="/terms"
                className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
              >
                Terms of Service
              </a>
            </nav>
          </div>

          <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 sm:mt-8 sm:flex-row sm:items-center">
            <p className="text-xs sm:text-sm text-zinc-500">
              © {year} Glimz. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-400">
              <a
                href="#top"
                className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
              >
                Back to top
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
