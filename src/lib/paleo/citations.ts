import { Dinosaur, DinosaurSummary } from '@/lib/types';

export interface SpecimenCitations {
  apa: string;
  mla: string;
  bibtex: string;
}

type CitableSpecimen = Pick<
  Dinosaur | DinosaurSummary,
  'id' | 'name' | 'scientificName' | 'period' | 'subPeriod' | 'locationFound' | 'myaStart' | 'myaEnd'
> & {
  discovered?: string;
};

function formatDateParts(date: Date) {
  const year = date.getFullYear();
  const monthNamesLong = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthNamesShort = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
    'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
  ];
  const day = date.getDate();
  const monthIdx = date.getMonth();
  const iso = date.toISOString().slice(0, 10);

  return {
    year,
    apaDate: `${monthNamesLong[monthIdx]} ${day}, ${year}`,
    mlaDate: `${day} ${monthNamesShort[monthIdx]} ${year}`,
    iso,
  };
}

export function buildSpecimenCitations(
  specimen: CitableSpecimen,
  pageUrl: string,
  now: Date = new Date()
): SpecimenCitations {
  const { year, apaDate, mlaDate, iso } = formatDateParts(now);
  const safeId = specimen.id.replace(/[^a-z0-9_]/gi, '_');
  const eraText = specimen.subPeriod || specimen.period;
  const ageSuffix =
    specimen.myaStart !== undefined && specimen.myaEnd !== undefined
      ? ` (${specimen.myaStart}–${specimen.myaEnd} Ma)`
      : '';

  const apa = `WikiDino Paleontology Archive. (${year}). ${specimen.name} (${specimen.scientificName}) [Paleontology specimen dossier]. Retrieved ${apaDate}, from ${pageUrl}`;

  const mla = `"${specimen.name} (${specimen.scientificName})." WikiDino: Digital Paleontology & Fossil Archive, ${year}, ${pageUrl}. Accessed ${mlaDate}.`;

  const bibtex = [
    `@misc{wikidino_${safeId}_${year},`,
    `  author       = {{WikiDino Paleontology Archive}},`,
    `  title        = {${specimen.name} (${specimen.scientificName}) --- Paleontology Specimen Dossier},`,
    `  year         = {${year}},`,
    `  howpublished = {\\url{${pageUrl}}},`,
    `  note         = {Stratigraphy: ${eraText}${ageSuffix}; Provenance: ${specimen.locationFound || 'Global Archive'}; Accessed: ${iso}}`,
    `}`,
  ].join('\n');

  return { apa, mla, bibtex };
}

export function buildNotebookExportText(
  specimens: CitableSpecimen[],
  origin: string,
  format: 'markdown' | 'bibtex' = 'markdown'
): string {
  const now = new Date();
  if (format === 'bibtex') {
    return specimens
      .map((item) => buildSpecimenCitations(item, `${origin}/species/${item.id}`, now).bibtex)
      .join('\n\n');
  }

  const header = `# WikiDino Field Notebook (${now.toISOString().slice(0, 10)})\nTotal Specimens: ${specimens.length}\n`;
  const lines = specimens.map((item, idx) => {
    const era = item.subPeriod || item.period;
    const mya =
      item.myaStart !== undefined && item.myaEnd !== undefined
        ? ` | ${item.myaStart}–${item.myaEnd} Ma`
        : '';
    return `${idx + 1}. **${item.name}** (*${item.scientificName}*) — ${era}${mya} | ${item.locationFound || 'Global Archive'} -> ${origin}/species/${item.id}`;
  });

  return [header, ...lines].join('\n');
}
