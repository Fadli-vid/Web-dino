export interface Dinosaur {
  id: string;
  name: string;
  scientificName: string;
  period: 'Triassic' | 'Jurassic' | 'Cretaceous';
  length: number; // in meters
  weight: number; // in kg
  diet: 'Carnivore' | 'Herbivore' | 'Omnivore';
  description: string;
  image: string;
  imageAlt: string;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  characteristics: string[];
  fossils: string;
  discovered: string;
  locationFound: string;
  sizeComparisonUrl?: string;
  habitatMapUrl?: string;
  evolutionaryTreeUrl?: string;
}

export type FilterOptions = {
  period?: string[];
  diet?: string[];
};
