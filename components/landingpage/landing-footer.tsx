'use client';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-display)] font-bold text-foreground">
            WIKIDINO
          </span>
          <span>: Digital Paleontology & Fossil Archive</span>
        </div>
        <div>
          Specimen records curated for educational and scientific research purposes.
        </div>
      </div>
    </footer>
  );
}
