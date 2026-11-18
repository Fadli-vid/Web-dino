export type DinosaurPeriod = 'Triassic' | 'Jurassic' | 'Cretaceous';
export type DinosaurDiet = 'Carnivore' | 'Herbivore' | 'Omnivore' | 'Piscivore' | 'Insectivore';
export type DinosaurLocomotion = 'Bipedal' | 'Quadrupedal' | 'Facultative Biped';

export interface DinosaurTaxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Dinosaur {
  id: string;
  name: string;
  scientificName: string;
  period: DinosaurPeriod;
  subPeriod?: string;
  myaStart?: number; // Older bound in Million Years Ago (Ma)
  myaEnd?: number;   // Younger bound in Million Years Ago (Ma)
  length: number;    // in meters
  weight: number;    // in kg
  diet: DinosaurDiet;
  locomotion?: DinosaurLocomotion | string;
  continent?: string;
  description: string;
  image: string;
  imageAlt: string;
  taxonomy: DinosaurTaxonomy;
  characteristics: string[];
  fossils: string;
  discovered: string;
  locationFound: string;
  sizeComparisonUrl?: string;
  habitatMapUrl?: string;
  evolutionaryTreeUrl?: string;
}

/**
 * Lightweight projection for Command Palette, Smart Recommendation, and Analytics.
 * Omits large narrative description, characteristics, and auxiliary URLs.
 */
export interface DinosaurSummary {
  id: string;
  name: string;
  scientificName: string;
  period: DinosaurPeriod;
  subPeriod?: string;
  myaStart?: number;
  myaEnd?: number;
  length: number;
  weight: number;
  diet: DinosaurDiet;
  locomotion?: string;
  continent?: string;
  locationFound: string;
  image: string;
  taxonomy: Pick<DinosaurTaxonomy, 'order' | 'family' | 'genus'>;
}

export interface AiAnalysisCacheRecord<T = unknown> {
  cacheKey: string;
  featureType: string;
  speciesIds: string;
  promptTag?: string;
  responseData: T;
  modelUsed?: string;
  createdAt: string;
}

export type FilterOptions = {
  period?: string[];
  diet?: string[];
};
