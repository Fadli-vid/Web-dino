import { Dinosaur } from './types';
import { dbPool } from './tidb';
import { RowDataPacket } from 'mysql2';

function mapRowToDinosaur(dino: any): Dinosaur {
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
}

export async function getDinosaurByIdServer(id: string): Promise<Dinosaur | null> {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM dinosaurs WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return mapRowToDinosaur(rows[0]);
  } catch (error) {
    console.error('Error fetching dinosaur by ID from TiDB database:', error);
    return null;
  }
}

export async function getDinosaursServer(): Promise<Dinosaur[]> {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM dinosaurs ORDER BY name ASC');
    return rows.map(mapRowToDinosaur);
  } catch (error) {
    console.error('Error fetching dinosaurs from TiDB database:', error);
    return [];
  }
}
