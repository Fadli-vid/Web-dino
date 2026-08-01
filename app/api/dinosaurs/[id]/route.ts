import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/tidb';
import { Dinosaur } from '@/lib/types';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM dinosaurs WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Dinosaur not found' }, { status: 404 });
    }

    const dino = rows[0];
    const taxonomy = typeof dino.taxonomy === 'string' ? JSON.parse(dino.taxonomy) : (dino.taxonomy || {});
    const characteristics = typeof dino.characteristics === 'string' ? JSON.parse(dino.characteristics) : (dino.characteristics || []);

    const dinosaur: Dinosaur = {
      id: dino.id,
      name: dino.name,
      scientificName: dino.scientific_name,
      period: dino.period,
      length: Number(dino.length) || 0,
      weight: Number(dino.weight) || 0,
      diet: dino.diet,
      description: dino.description || '',
      image: dino.image || 'https://images.unsplash.com/photo-1618930157654-43a39d50c41c?w=500&h=500&fit=crop',
      imageAlt: dino.image_alt || (dino.name + ' illustration'),
      taxonomy,
      characteristics,
      fossils: dino.fossils || '',
      discovered: dino.discovered || '',
      locationFound: dino.location_found || '',
      sizeComparisonUrl: dino.size_comparison_url || undefined,
      habitatMapUrl: dino.habitat_map_url || undefined,
      evolutionaryTreeUrl: dino.evolutionary_tree_url || undefined,
    };

    return NextResponse.json(dinosaur);
  } catch (error) {
    console.error('API Error fetching dinosaur by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch dinosaur from TiDB' }, { status: 500 });
  }
}
