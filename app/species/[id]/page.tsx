import { DinosaurDetail } from '@/components/dinosaur/dinosaur-detail';
import { getDinosaurById } from '@/lib/dinosaurs-data';
import { notFound } from 'next/navigation';

interface SpeciesPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SpeciesPageProps) {
  const { id } = await params;
  const dinosaur = getDinosaurById(id);

  if (!dinosaur) {
    return {
      title: 'Species Not Found',
    };
  }

  return {
    title: `${dinosaur.name} - Dinosaur Encyclopedia`,
    description: dinosaur.description,
  };
}

export default async function SpeciesPage({ params }: SpeciesPageProps) {
  const { id } = await params;
  const dinosaur = getDinosaurById(id);

  if (!dinosaur) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-muted-foreground/10 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Dinosaur Encyclopedia</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <DinosaurDetail dinosaur={dinosaur} />
      </div>
    </main>
  );
}
