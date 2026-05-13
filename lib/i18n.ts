import { Activity, ActivityVariation, Language } from '@/types/activity';

export function getTitle(a: Activity, lang: Language): string {
  if (lang === 'he' && a.title_he) return a.title_he;
  if (process.env.NODE_ENV === 'development' && lang === 'he' && !a.title_he) {
    console.warn(`[i18n] Missing title_he for activity: ${a.title}`);
  }
  return a.title;
}

export function getDescription(a: Activity, lang: Language): string {
  if (lang === 'he' && a.description_he) return a.description_he;
  return a.description;
}

export function getInstructions(a: Activity, lang: Language): string {
  if (lang === 'he' && a.instructions_he) return a.instructions_he;
  return a.instructions;
}

export function getWhyItWorks(a: Activity, lang: Language): string | undefined {
  if (lang === 'he' && a.why_it_works_he) return a.why_it_works_he;
  return a.why_it_works;
}

export function getVariations(a: Activity, lang: Language): ActivityVariation[] {
  if (lang === 'he' && a.variations_he && a.variations_he.length > 0) {
    return a.variations_he;
  }
  return a.variations;
}

export function getEducationalGoal(a: Activity, lang: Language): string | undefined {
  if (lang === 'he' && a.educational_goal_he) return a.educational_goal_he;
  return a.educational_goal;
}

// ── Materials translation ─────────────────────────────────────────────────────
// Seed activities store materials in English. This map provides Hebrew display
// translations so Hebrew-mode users never see raw English equipment strings.

const MATERIALS_HE: Record<string, string> = {
  // Seed activity materials
  'paper for scorekeeping':                  'נייר לניקוד',
  'optional: whiteboard or flip chart':      'אופציונלי: לוח לבן',
  'paper or whiteboard per team':            'נייר / לוח לבן לכל קבוצה',
  'markers or pens':                         'טושים / עפרונות',
  'word list (included in variations)':      'רשימת מילים (כלולה בוריאציות)',
  'newspaper (several pages per team)':      'עיתונים (מספר עמודים לכל קבוצה)',
  'masking tape':                            'טייפ נייר',
  'optional: music for the runway':          'אופציונלי: מוזיקה לתצוגה',
  'paper per team (large)':                  'גיליון נייר גדול לכל קבוצה',
  'markers or colored pencils':             'טושים / עפרונות צבעוניים',
  'bingo cards (1 per camper)':             'כרטיסי בינגו (אחד לכל חניך)',
  'markers or coins as chips':              'טושים או מטבעות/אסימונים',
  'word caller cards':                       'כרטיסיות מילים למנחה',
  'pool noodles (1 per team)':              'מקלוני שחייה (אחד לכל קבוצה)',
  'lane markers or buoys':                   'מתחמי שחייה / ציפיות',
  '1–2 hula hoops':                         '1–2 חישוקים',
  // Common generic terms
  'markers':        'טושים',
  'paper':          'נייר',
  'whiteboard':     'לוח לבן',
  'bingo cards':    'כרטיסי בינגו',
  'pool noodles':   'מקלוני שחייה',
  'hula hoops':     'חישוקים',
  'newspaper':      'עיתון',
  'tape':           'טייפ',
  'rope':           'חבל',
  'cones':          'קונוסים',
  'ball':           'כדור',
  'balls':          'כדורים',
  'music':          'מוזיקה',
  'speaker':        'רמקול',
  'chairs':         'כיסאות',
};

export function translateMaterial(material: string, lang: Language): string {
  if (lang !== 'he') return material;
  return MATERIALS_HE[material.toLowerCase()] ?? material;
}

export function translateMaterials(materials: string[], lang: Language): string[] {
  if (lang !== 'he') return materials;
  return materials.map((m) => translateMaterial(m, lang));
}
