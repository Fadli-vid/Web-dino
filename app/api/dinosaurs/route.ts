import { NextResponse } from 'next/server';
import { dbPool } from '@/lib/tidb';
import { Dinosaur } from '@/lib/types';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM dinosaurs ORDER BY name ASC');
    
    const dinosaurs: Dinosaur[] = rows.map((dino) => {
      const taxonomy = typeof dino.taxonomy === 'string' ? JSON.parse(dino.taxonomy) : (dino.taxonomy || {});
      const characteristics = typeof dino.characteristics === 'string' ? JSON.parse(dino.characteristics) : (dino.characteristics || []);

      return {
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
    });

    return NextResponse.json(dinosaurs);
  } catch (error) {
    console.error('API Error fetching dinosaurs:', error);
    return NextResponse.json({ error: 'Failed to fetch dinosaurs from TiDB' }, { status: 500 });
  }
}
