import { Suspense } from 'react';
import Image from 'next/image';
import { getDinosaursServer } from '@/lib/db/dinosaurs-server';
import { HomePageClient } from '@/components/catalog';

// Incremental Static Regeneration: Cache landing page HTML and initial catalog for 1 hour
export const revalidate = 3600;

export default async function HomePage() {
  const initialDinosaurs = await getDinosaursServer();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground font-mono text-center">
            <Image
              src="/Loading.gif"
              alt="Loading Paleontology Archive"
              width={288}
              height={288}
              unoptimized
              priority
              className="w-60 h-60 sm:w-72 sm:h-72 object-contain"
            />
            <span>Loading Paleontology Archive...</span>
          </div>
        </div>
      }
    >
      <HomePageClient initialDinosaurs={initialDinosaurs} />
    </Suspense>
  );
}
