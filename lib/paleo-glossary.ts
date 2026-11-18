export type GlossaryCategory = 'Anatomy' | 'Taxonomy' | 'Geology' | 'Paleobiology';

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  category: GlossaryCategory;
  definition: string;
}

export const PALEO_GLOSSARY: GlossaryEntry[] = [
  // Anatomy & Biomechanics
  {
    id: 'bipedal',
    term: 'Bipedal',
    aliases: ['bipedal', 'bipedalism'],
    category: 'Anatomy',
    definition: 'Moving primarily on two hind legs, freeing the forelimbs for grasping, balance, or specialized functions.',
  },
  {
    id: 'quadrupedal',
    term: 'Quadrupedal',
    aliases: ['quadrupedal', 'quadruped'],
    category: 'Anatomy',
    definition: 'Walking on all four limbs, typical of massive sauropods, armored thyreophorans, and horned ceratopsians.',
  },
  {
    id: 'facultative-biped',
    term: 'Facultative Biped',
    aliases: ['facultative biped', 'facultative bipedal'],
    category: 'Anatomy',
    definition: 'An animal that normally walks on four legs while feeding or moving slowly, but can rear up and run on two hind legs when needed.',
  },
  {
    id: 'cursorial',
    term: 'Cursorial',
    aliases: ['cursorial'],
    category: 'Anatomy',
    definition: 'Anatomically adapted for fast running, characterized by elongated lower leg bones and lightweight limb proportions.',
  },
  {
    id: 'osteoderms',
    term: 'Osteoderms',
    aliases: ['osteoderms', 'osteoderm'],
    category: 'Anatomy',
    definition: 'Bony deposits embedded directly within the skin that formed protective scales, plates, or armor knobs.',
  },
  {
    id: 'dental-batteries',
    term: 'Dental Batteries',
    aliases: ['dental batteries', 'tooth batteries'],
    category: 'Anatomy',
    definition: 'Hundreds of tightly packed, continuously replaced teeth forming a self-sharpening grinding or shearing surface for tough plants.',
  },
  {
    id: 'neural-spines',
    term: 'Neural Spines',
    aliases: ['neural spines'],
    category: 'Anatomy',
    definition: 'Upward-projecting bony blades on vertebrae that anchored strong back muscles or supported sails and ridges.',
  },
  {
    id: 'thagomizer',
    term: 'Thagomizer',
    aliases: ['thagomizer'],
    category: 'Anatomy',
    definition: 'The distinctive arrangement of four or more pointed bony spikes at the tip of a stegosaur tail used for defense.',
  },
  {
    id: 'cranial-crest',
    term: 'Cranial Crest',
    aliases: ['cranial crest', 'cranial crests', 'hollow crest'],
    category: 'Anatomy',
    definition: 'A bony projection on the skull; in lambeosaurine hadrosaurs it enclosed nasal airways that likely functioned as a vocal resonator.',
  },
  {
    id: 'brow-horns',
    term: 'Brow Horns',
    aliases: ['brow horns'],
    category: 'Anatomy',
    definition: 'Paired postorbital horns growing above the eye sockets in chasmosaurine ceratopsians like Triceratops.',
  },
  {
    id: 'frill',
    term: 'Neck Frill',
    aliases: ['neck frill', 'frill'],
    category: 'Anatomy',
    definition: 'An expanded shelf of bone extending from the back of a ceratopsian skull, supporting jaw muscles, display, and neck protection.',
  },
  {
    id: 'protofeathers',
    term: 'Protofeathers',
    aliases: ['protofeathers', 'filamentous feathers', 'filament-like feathers'],
    category: 'Anatomy',
    definition: 'Early hair-like or downy integumentary filaments found on non-avian theropods, evolving initially for insulation and display before flight.',
  },
  {
    id: 'keratin',
    term: 'Keratin',
    aliases: ['keratin'],
    category: 'Anatomy',
    definition: 'Tough fibrous structural protein forming beaks, claw sheaths, horn coverings, and scales—similar to modern bird beaks and fingernails.',
  },
  {
    id: 'sickle-claw',
    term: 'Sickle Claw',
    aliases: ['sickle claw', 'sickle-shaped claw', 'killing claw'],
    category: 'Anatomy',
    definition: 'The hyper-extensible, sharply curved second-toe claw characteristic of dromaeosaurid and troodontid theropods.',
  },
  {
    id: 'postcranial',
    term: 'Postcranial',
    aliases: ['postcranial'],
    category: 'Anatomy',
    definition: 'Referring to all parts of the skeleton excluding the skull (vertebrae, ribs, pelvis, and limbs).',
  },

  // Taxonomy & Clades
  {
    id: 'saurischian',
    term: 'Saurischia',
    aliases: ['saurischian', 'saurischians'],
    category: 'Taxonomy',
    definition: 'One of the two major dinosaur clades ("lizard-hipped"), encompassing theropods (including birds) and sauropodomorphs.',
  },
  {
    id: 'ornithischian',
    term: 'Ornithischia',
    aliases: ['ornithischian', 'ornithischians'],
    category: 'Taxonomy',
    definition: 'The "bird-hipped" herbivorous dinosaur clade including ceratopsians, hadrosaurs, ankylosaurs, stegosaurs, and pachycephalosaurs.',
  },
  {
    id: 'theropod',
    term: 'Theropoda',
    aliases: ['theropods', 'theropod'],
    category: 'Taxonomy',
    definition: 'A clade of hollow-boned, predominantly bipedal dinosaurs including most carnivores as well as the ancestors of modern birds.',
  },
  {
    id: 'sauropod',
    term: 'Sauropoda',
    aliases: ['sauropods', 'sauropod'],
    category: 'Taxonomy',
    definition: 'Gigantic quadrupedal herbivores distinguished by long necks, small heads, pillar-like limbs, and long counterbalancing tails.',
  },
  {
    id: 'sauropodomorph',
    term: 'Sauropodomorph',
    aliases: ['sauropodomorphs', 'sauropodomorph'],
    category: 'Taxonomy',
    definition: 'Broad clade spanning early bipedal/transitional "prosauropods" (like Plateosaurus) to the colossal Jurassic and Cretaceous sauropods.',
  },
  {
    id: 'diplodocid',
    term: 'Diplodocid',
    aliases: ['diplodocids', 'diplodocid'],
    category: 'Taxonomy',
    definition: 'Family of elongated Jurassic sauropods with peg-like front teeth and extremely long whip-like tails (e.g., Diplodocus, Apatosaurus).',
  },
  {
    id: 'titanosaur',
    term: 'Titanosauria',
    aliases: ['titanosaurs', 'titanosaur'],
    category: 'Taxonomy',
    definition: 'The last surviving and most massive clade of Cretaceous sauropods, including South American giants like Patagotitan and Argentinosaurus.',
  },
  {
    id: 'ornithopod',
    term: 'Ornithopoda',
    aliases: ['ornithopods', 'ornithopod'],
    category: 'Taxonomy',
    definition: 'Successful group of beaked, plant-eating dinosaurs ranging from small agile runners to large iguanodontians and hadrosaurs.',
  },
  {
    id: 'iguanodontian',
    term: 'Iguanodontian',
    aliases: ['iguanodontians', 'iguanodontian'],
    category: 'Taxonomy',
    definition: 'Large Cretaceous ornithopods bridging basal runners and duck-billed hadrosaurs, often sporting conical thumb spikes.',
  },
  {
    id: 'hadrosaur',
    term: 'Hadrosauridae',
    aliases: ['hadrosaurids', 'hadrosaurid', 'hadrosaurs', 'hadrosaur'],
    category: 'Taxonomy',
    definition: 'Late Cretaceous "duck-billed" herbivores equipped with wide cropping beaks and dense dental batteries for chewing plants.',
  },
  {
    id: 'lambeosaurine',
    term: 'Lambeosaurinae',
    aliases: ['lambeosaurines', 'lambeosaurine'],
    category: 'Taxonomy',
    definition: 'Subfamily of duck-billed hadrosaurs known for elaborate hollow cranial crests connected to their nasal passages.',
  },
  {
    id: 'ceratopsian',
    term: 'Ceratopsia',
    aliases: ['ceratopsians', 'ceratopsian', 'ceratopsids', 'ceratopsid'],
    category: 'Taxonomy',
    definition: 'Horned and frilled herbivorous dinosaurs characterized by a rostral parrot-like beak and flared skull frill.',
  },
  {
    id: 'ankylosaur',
    term: 'Ankylosauridae',
    aliases: ['ankylosaurids', 'ankylosaurid', 'ankylosaurs', 'ankylosaur'],
    category: 'Taxonomy',
    definition: 'Heavily armored, low-slung herbivorous dinosaurs bearing extensive bony osteoderms and a fused tail club.',
  },
  {
    id: 'nodosaurid',
    term: 'Nodosauridae',
    aliases: ['nodosaurids', 'nodosaurid'],
    category: 'Taxonomy',
    definition: 'Armored dinosaurs closely related to ankylosaurids that typically had shoulder spikes but lacked a bony tail club.',
  },
  {
    id: 'stegosaur',
    term: 'Stegosauridae',
    aliases: ['stegosaurids', 'stegosaurid', 'stegosaurs', 'stegosaur'],
    category: 'Taxonomy',
    definition: 'Jurassic armored dinosaurs distinguished by double rows of upright dorsal plates or spines and a spiked defensive tail.',
  },
  {
    id: 'dromaeosaurid',
    term: 'Dromaeosauridae',
    aliases: ['dromaeosaurids', 'dromaeosaurid'],
    category: 'Taxonomy',
    definition: 'Feathered, bird-like predatory theropods ("raptors") equipped with an enlarged sickle claw and stiffened balancing tail.',
  },
  {
    id: 'abelisaurid',
    term: 'Abelisauridae',
    aliases: ['abelisaurids', 'abelisaurid'],
    category: 'Taxonomy',
    definition: 'Southern-hemisphere Cretaceous theropods featuring short, deep, ornamented skulls and vestigial tiny forelimbs.',
  },
  {
    id: 'carcharodontosaurid',
    term: 'Carcharodontosauridae',
    aliases: ['carcharodontosaurids', 'carcharodontosaurid', 'carcharodontosaurian', 'allosauroid'],
    category: 'Taxonomy',
    definition: 'Giant predatory theropods related to Allosaurus, equipped with long skulls and thin, shark-like serrated slicing teeth.',
  },
  {
    id: 'tyrannosaurid',
    term: 'Tyrannosauridae',
    aliases: ['tyrannosaurids', 'tyrannosaurid', 'tyrannosauroids', 'tyrannosauroid'],
    category: 'Taxonomy',
    definition: 'Apex Late Cretaceous predators evolving massive bone-crushing jaws and reduced two-fingered forelimbs.',
  },
  {
    id: 'maniraptoran',
    term: 'Maniraptora',
    aliases: ['maniraptorans', 'maniraptoran', 'oviraptorosaurs', 'oviraptorosaur', 'ornithomimids', 'ornithomimid', 'troodontid', 'alvarezsaurid'],
    category: 'Taxonomy',
    definition: 'Derived feathered theropod clade possessing a specialized half-moon wrist bone; includes birds and their closest dinosaur kin.',
  },
  {
    id: 'spinosaurid',
    term: 'Spinosauridae',
    aliases: ['spinosaurids', 'spinosaurid'],
    category: 'Taxonomy',
    definition: 'Specialized theropods with elongated crocodile-like snouts, conical fish-gripping teeth, and aquatic/riverine adaptations.',
  },

  // Paleobiology & Geology
  {
    id: 'semi-aquatic',
    term: 'Semi-Aquatic',
    aliases: ['semi-aquatic'],
    category: 'Paleobiology',
    definition: 'Adapted to split time between water and land, foraging along rivers, deltas, and coastal wetlands.',
  },
  {
    id: 'apex-predator',
    term: 'Apex Predator',
    aliases: ['apex predator'],
    category: 'Paleobiology',
    definition: 'Top trophic-level carnivore within an ecosystem with no natural adult predators.',
  },
  {
    id: 'piscivore',
    term: 'Piscivore',
    aliases: ['piscivore'],
    category: 'Paleobiology',
    definition: 'An animal whose diet consists primarily of fish.',
  },
  {
    id: 'insectivore',
    term: 'Insectivore',
    aliases: ['insectivore'],
    category: 'Paleobiology',
    definition: 'An animal adapted to feeding predominantly on insects and small invertebrates.',
  },
  {
    id: 'bonebed',
    term: 'Bonebed',
    aliases: ['bonebeds', 'bonebed'],
    category: 'Geology',
    definition: 'A dense geological layer containing fossilized bones of multiple individuals, often indicating herd living or mass mortality events.',
  },
  {
    id: 'skin-impressions',
    term: 'Skin Impressions',
    aliases: ['skin impressions', 'soft tissue'],
    category: 'Geology',
    definition: 'Rare fossilized traces of scales, feathers, or dermis preserved when carcasses were buried rapidly in fine sediment.',
  },
  {
    id: 'morrison-formation',
    term: 'Morrison Formation',
    aliases: ['Morrison Formation'],
    category: 'Geology',
    definition: 'Iconic Late Jurassic sedimentary sequence (157–148 Ma) across western North America famous for Allosaurus, Stegosaurus, and giant sauropods.',
  },
  {
    id: 'hell-creek',
    term: 'Hell Creek Ecosystem',
    aliases: ['Hell Creek'],
    category: 'Geology',
    definition: 'Terminal Late Cretaceous formation (68–66 Ma) preserving the final dinosaur fauna (T. rex, Triceratops) right up to the K-Pg asteroid impact.',
  },
  {
    id: 'nemegt-formation',
    term: 'Nemegt Formation',
    aliases: ['Nemegt Formation'],
    category: 'Geology',
    definition: 'Late Cretaceous (71–66 Ma) river-delta fossil beds in Mongolia yielding Tarbosaurus, Therizinosaurus, Gallimimus, and Mononykus.',
  },
  {
    id: 'ischigualasto',
    term: 'Ischigualasto Formation',
    aliases: ['Ischigualasto'],
    category: 'Geology',
    definition: 'Late Triassic (~231–229 Ma) Argentine rock formation preserving some of the earliest known dinosaurs such as Eoraptor and Herrerasaurus.',
  },
];

// Build alias -> entry lookup and sorted regex pattern once at module load
const ALIAS_MAP = new Map<string, GlossaryEntry>();
const ALL_ALIASES: string[] = [];

for (const entry of PALEO_GLOSSARY) {
  for (const alias of entry.aliases) {
    const key = alias.toLowerCase();
    if (!ALIAS_MAP.has(key)) {
      ALIAS_MAP.set(key, entry);
      ALL_ALIASES.push(alias);
    }
  }
}

ALL_ALIASES.sort((a, b) => b.length - a.length);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GLOSSARY_REGEX = new RegExp(
  `\\b(${ALL_ALIASES.map(escapeRegex).join('|')})\\b`,
  'gi'
);

export interface GlossaryToken {
  text: string;
  entry?: GlossaryEntry;
}

/**
 * Splits a paleontological text into plain text and matched glossary term tokens.
 * Highlights only the first occurrence of each glossary concept per block for clean readability.
 */
export function tokenizeGlossaryText(text: string): GlossaryToken[] {
  if (!text) return [];

  const tokens: GlossaryToken[] = [];
  const seenEntries = new Set<string>();
  let lastIndex = 0;

  GLOSSARY_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = GLOSSARY_REGEX.exec(text)) !== null) {
    const matchedText = match[0];
    const start = match.index;
    const entry = ALIAS_MAP.get(matchedText.toLowerCase());

    if (!entry || seenEntries.has(entry.id)) {
      continue;
    }

    if (start > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, start) });
    }

    seenEntries.add(entry.id);
    tokens.push({ text: matchedText, entry });
    lastIndex = start + matchedText.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ text }];
}
