import { NextResponse } from 'next/server';
import { getDinosaursServer } from '@/lib/dinosaurs-server';

// Next.js Route Cache: revalidate every hour
export const revalidate = 3600;

export async function GET() {
  try {
    const dinosaurs = await getDinosaursServer();

    return NextResponse.json(dinosaurs, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error fetching dinosaurs:', error);
    return NextResponse.json({ error: 'Failed to fetch dinosaurs from TiDB' }, { status: 500 });
  }
}
