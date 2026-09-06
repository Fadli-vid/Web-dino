import { DinosaurDetail } from '@/components/dinosaur/dinosaur-detail';
import { getDinosaurByIdServer } from '@/lib/dinosaurs-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeciesPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SpeciesPageProps) {
  const { id } = await params;
  const dinosaur = await getDinosaurByIdServer(id);

  if (!dinosaur) {
    return {
      title: 'Species Not Found - Wikidino',
    };
  }

  return {
    title: `${dinosaur.name} (${dinosaur.scientificName}) - Paleontology Dossier`,
    description: dinosaur.description,
  };
}

export default async function SpeciesPage({ params }: SpeciesPageProps) {
  const { id } = await params;
  const dinosaur = await getDinosaurByIdServer(id);

  if (!dinosaur) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-foreground">
                WIKIDINO
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80">
                Paleontology Archive
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Dossier: #{dinosaur.id.toUpperCase()}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-border/80 text-xs">
              <Link href="/" className="flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Archive</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Specimen Dossier Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
        <DinosaurDetail dinosaur={dinosaur} />
      </main>

      {/* Museum Footer */}
      <footer className="border-t border-border/60 bg-muted/20 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-display)] font-bold text-foreground">WIKIDINO</span>
            <span>: Digital Paleontology & Fossil Archive</span>
          </div>
          <div>
            Specimen records curated for educational and scientific research purposes.
          </div>
        </div>
      </footer>
    </div>
  );
}
