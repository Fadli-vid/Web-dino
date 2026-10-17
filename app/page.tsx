import { Suspense } from 'react';
import { getDinosaursServer } from '@/lib/dinosaurs-server';
import { HomePageClient } from '@/components/landingpage';

// Incremental Static Regeneration: Cache landing page HTML and initial catalog for 1 hour
export const revalidate = 3600;

export default async function HomePage() {
  const initialDinosaurs = await getDinosaursServer();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Loading Paleontology Archive...
          </div>
        </div>
      }
    >
      <HomePageClient initialDinosaurs={initialDinosaurs} />
    </Suspense>
  );
}
