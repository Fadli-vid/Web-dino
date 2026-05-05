import { supabase } from './supabase';
import { Dinosaur } from './types';

// Fungsi untuk mengambil semua data dinosaurus
export async function getDinosaurs(): Promise<Dinosaur[]> {
  const { data, error } = await supabase
    .from('dinosaurs')
    .select('*');

  if (error) {
    console.error('Error fetching dinosaurs:', error);
    return [];
  }

  // Melakukan pemetaan agar nama kolom DB (snake_case) 
  // kembali menjadi camelCase sesuai interface Typescript-mu
  return data.map((dino) => ({
    id: dino.id,
    name: dino.name,
    scientificName: dino.scientific_name,
    period: dino.period,
    length: dino.length,
    weight: dino.weight,
    diet: dino.diet,
    description: dino.description,
    image: dino.image || 'https://images.unsplash.com/photo-1618930157654-43a39d50c41c?w=500&h=500&fit=crop',
    imageAlt: dino.image_alt || dino.name + ' illustration',
    taxonomy: dino.taxonomy,
    characteristics: dino.characteristics,
    fossils: dino.fossils,
    discovered: dino.discovered,
    locationFound: dino.location_found,
  }));
}

// Fungsi untuk mengambil satu dinosaurus berdasarkan ID
export async function getDinosaurById(id: string): Promise<Dinosaur | null> {
  const { data, error } = await supabase
    .from('dinosaurs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching dinosaur by ID:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    scientificName: data.scientific_name,
    period: data.period,
    length: data.length,
    weight: data.weight,
    diet: data.diet,
    description: data.description,
    image: data.image || 'https://images.unsplash.com/photo-1618930157654-43a39d50c41c?w=500&h=500&fit=crop',
    imageAlt: data.image_alt || data.name + ' illustration',
    taxonomy: data.taxonomy,
    characteristics: data.characteristics,
    fossils: data.fossils,
    discovered: data.discovered,
    locationFound: data.location_found,
  };
}