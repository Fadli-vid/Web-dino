import { NextResponse } from 'next/server';
import { getDinosaursSummaryServer } from '@/lib/db/dinosaurs-server';

// Static/ISR lightweight summary route cached for 1 hour (for Command Palette & quick lookup)
export const revalidate = 3600;

export async function GET() {
  try {
    const summaries = await getDinosaursSummaryServer();

    return NextResponse.json(summaries, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error fetching dinosaur summaries:', error);
    return NextResponse.json({ error: 'Failed to fetch dinosaur summaries from TiDB' }, { status: 500 });
  }
}
