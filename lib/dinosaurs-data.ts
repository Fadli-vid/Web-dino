import { Dinosaur } from './types';

// Client-safe fetch functions for Client Components
export async function getDinosaurs(): Promise<Dinosaur[]> {
  try {
    const res = await fetch('/api/dinosaurs');
    if (!res.ok) throw new Error('Failed to fetch dinosaurs');
    return await res.json();
  } catch (error) {
    console.error('Error fetching dinosaurs from API:', error);
    return [];
  }
}

export async function getDinosaurById(id: string): Promise<Dinosaur | null> {
  try {
    const res = await fetch(`/api/dinosaurs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching dinosaur by ID from API:', error);
    return null;
  }
}