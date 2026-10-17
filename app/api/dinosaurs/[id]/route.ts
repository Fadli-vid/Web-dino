import { NextRequest, NextResponse } from 'next/server';
import { getDinosaurByIdServer } from '@/lib/dinosaurs-server';

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dinosaur = await getDinosaurByIdServer(id);

    if (!dinosaur) {
      return NextResponse.json({ error: 'Dinosaur not found' }, { status: 404 });
    }

    return NextResponse.json(dinosaur, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error fetching dinosaur by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch dinosaur from TiDB' }, { status: 500 });
  }
}
