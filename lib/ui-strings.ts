import { Language } from '@/types/activity';

// [0] = Hebrew  [1] = English
type S = [string, string];

const STRINGS: Record<string, S> = {
  // ── Navigation ──────────────────────────────────────────────
  'nav.home':    ['בית',    'Home'],
  'nav.magic':   ['MAGIC',  'MAGIC'],
  'nav.bank':    ['בנק',    'Bank'],
  'nav.profile': ['פרופיל', 'Profile'],

  // ── Emergency FAB ────────────────────────────────────────────
  'fab.line1':   ['צריך פעילות',   'Need Activity'],
  'fab.line2':   ['עכשיו',         'Now'],
  'fab.aria':    ['צריך פעילות עכשיו', 'Need Activity Now'],

  // ── Home page ────────────────────────────────────────────────
  'home.role.waterfront':     ['מדריך אגם', 'Waterfront Instructor'],
  'home.role.social':         ['מדריך',     'Counselor'],
  'home.age_prefix':          ['גיל',       'Age'],
  'home.nudge.title':         ['הגדר את הפרופיל שלך',          'Set Up Your Profile'],
  'home.nudge.sub':           ['לפעילויות מותאמות לקבוצה שלך', 'For activities tailored to your group'],
  'home.section':             ['מה צריך עכשיו?',               'What do you need?'],
  'home.tip':                 ['לחץ על 🚨 צריך פעילות עכשיו בכל רגע כדי למצוא פעילות מיידית.', 'Tap 🚨 Need Activity Now at any moment to find an instant activity.'],

  // Home action labels (both roles)
  'home.action.emergency.label': ['צריך פעילות עכשיו',      'Need Activity Now'],
  'home.action.emergency.desc':  ['מצא פעילות תוך שניות',   'Find an activity in seconds'],
  'home.action.emergency.desc.water': ['מצא פעילות לאגם תוך שניות', 'Find a waterfront activity fast'],
  'home.action.magic.desc':      ['הפוך שעמום לכיף',       'Turn boredom into fun'],
  'home.action.magic.desc.water':['הפוך תרגול לחוויה',     'Turn drill into an experience'],
  'home.action.bank.label':      ['בנק פעילויות',           'Activity Bank'],
  'home.action.bank.desc':       ['כל הפעילויות במקום אחד', 'All activities in one place'],
  'home.action.bank.label.water':['פעילויות אגם',           'Waterfront Activities'],
  'home.action.bank.desc.water': ['פעילויות מים מוכנות',   'Ready-made water activities'],
  'home.action.syllabus.label':  ['סילבוס',                  'Syllabus'],
  'home.action.syllabus.desc':   ['ייבא פעילויות מקובץ',     'Import activities from a file'],
  'home.action.generate.label':  ['יצירה',                   'Generate'],
  'home.action.generate.desc':   ['פעילות מותאמת אישית',    'Custom activity'],

  // ── Profile page ─────────────────────────────────────────────
  'profile.title':       ['הפרופיל שלי',                        'My Profile'],
  'profile.subtitle':    ['כדי שנוכל להתאים פעילויות לקבוצה שלך', 'So we can tailor activities to your group'],
  'profile.name_label':  ['השם שלי',      'My Name'],
  'profile.role_label':  ['התפקיד שלי',   'My Role'],
  'profile.age_label':   ['העדה שלי',     'My Age Group'],
  'profile.lang_label':  ['🌐 שפת הממשק', '🌐 Display Language'],
  'profile.saved':       ['✓ נשמר!',      '✓ Saved!'],
  'profile.save':        ['שמור ➜',       'Save ➜'],

  // ── Emergency page ───────────────────────────────────────────
  'emergency.title':     ['🚨 צריך פעילות עכשיו',                  '🚨 Need Activity Now'],
  'emergency.subtitle':  ['מצא פעילות תוך שניות. ללא מקלדת.',       'Find an activity in seconds. No keyboard.'],
  'emergency.try_again': ['נסה שוב',                                'Try Again'],
  'emergency.new_search':['חיפוש חדש ←',                            '← New Search'],
  'emergency.ai_unavailable': ['לא נמצאה פעילות מתאימה בבנק, ויצירת AI אינה זמינה כרגע. מציג את הפעילויות הקרובות ביותר.', 'No matching activity found in the bank and AI is currently unavailable. Showing closest matches.'],
  'emergency.err.rate_limit': ['הגעת למגבלת ה-AI היומית. נסה מחר.', 'You reached the daily AI limit. Try again tomorrow.'],
  'emergency.err.generic':    ['משהו השתבש. אנא נסה שוב.',           'Something went wrong. Please try again.'],
  'emergency.err.no_match':   ['לא נמצאה פעילות מתאימה בבנק, ויצירת AI אינה זמינה כרגע.', 'No matching activity found in the bank, and AI is currently unavailable.'],
  'emergency.err.network':    ['לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט ונסה שוב.', 'Cannot connect to server. Check your internet connection.'],

  // ── Emergency form ───────────────────────────────────────────
  'eform.time':          ['⏱ כמה זמן יש?',           '⏱ How much time?'],
  'eform.location':      ['📍 איפה אתם?',             '📍 Where are you?'],
  'eform.energy':        ['⚡ אנרגיה של הקבוצה?',    '⚡ Group energy?'],
  'eform.group_size':    ['👥 כמה חניכים?',           '👥 How many campers?'],
  'eform.equipment':     ['🎒 איזה ציוד יש?',         '🎒 Equipment available?'],
  'eform.no_equipment':  ['✋ שום ציוד',               '✋ No Equipment'],
  'eform.topics':        ['🏷️ נושאים (אופציונלי)',    '🏷️ Topics (optional)'],
  'eform.searching':     ['מחפש פעילות...',           'Searching...'],
  'eform.find':          ['🚨 מצא לי פעילות',         '🚨 Find Me an Activity'],
  // Time options
  'eform.time.5':        ['5 דקות',  '5 min'],
  'eform.time.15':       ['15 דקות', '15 min'],
  'eform.time.30':       ['30 דקות', '30 min'],
  'eform.time.60':       ['שעה+',    '1 hr+'],
  // Location options
  'eform.loc.indoor':     ['בפנים',  'Indoor'],
  'eform.loc.outdoor':    ['בחוץ',   'Outdoor'],
  'eform.loc.waterfront': ['אגם',    'Waterfront'],
  'eform.loc.cabin':      ['צריף',   'Cabin'],
  'eform.loc.field':      ['מגרש',   'Field'],
  // Energy options
  'eform.energy.calm':      ['שקט',    'Calm'],
  'eform.energy.medium':    ['בינוני', 'Medium'],
  'eform.energy.energetic': ['פראי',   'High Energy'],
  // Group size options
  'eform.size.small':  ['עד 8',  'Up to 8'],
  'eform.size.medium': ['8–15',  '8–15'],
  'eform.size.large':  ['15–25', '15–25'],
  'eform.size.xlarge': ['25+',   '25+'],

  // ── Activity Result (emergency result cards) ─────────────────
  'result.safest':        ['הכי בטוחה ופשוטה', 'Safest & Simplest'],
  'result.most_fun':      ['הכי כיפית',         'Most Fun'],
  'result.most_edu':      ['הכי חינוכית',       'Most Educational'],
  'result.from_bank':     ['📋 מהבנק',          '📋 From Bank'],
  'result.ai_generated':  ['🤖 נוצר ע״י AI',   '🤖 AI Generated'],
  'result.rate_limited':  ['הגעת למגבלת ה-AI — מציג מהבנק', 'AI limit reached — showing from bank'],
  'result.fallback':      ['⏱ פעילות קצרה יותר שמצאנו', '⏱ Shorter activity found'],
  'result.equipment':     ['ציוד נדרש',         'Equipment'],
  'result.instructions':  ['איך מריצים',         'How to Run It'],
  'result.safety':        ['⚠️ הערות בטיחות',   '⚠️ Safety Notes'],
  'result.hebrew_el':     ['✡️ אלמנט עברי / יהודי', '✡️ Hebrew / Jewish Element'],
  'result.variation':     ['וריאציה מהירה',      'Quick Variation'],
  'result.no_equipment':  ['✋ ללא ציוד',         '✋ No Equipment'],
  'result.hebrew_badge':  ['✡️ עברית',           '✡️ Hebrew'],

  // ── Magic page ───────────────────────────────────────────────
  'magic.title':          ['✨ שעמום → MAGIC',               '✨ Boring → MAGIC'],
  'magic.subtitle':       ['הפוך משימה שגרתית לפעילות מרתקת', 'Turn a routine task into an engaging activity'],
  'magic.input_label':    ['מה צריך להפוך ל-MAGIC?',         'What needs the MAGIC treatment?'],
  'magic.placeholder':    ['לדוגמה: לחכות 10 דקות לפני חדר האוכל...', 'E.g. Waiting 10 minutes before the dining hall...'],
  'magic.examples':       ['דוגמאות מהירות:',    'Quick examples:'],
  'magic.context':        ['הוסף הקשר',          'Add Context'],
  'magic.context_set':    ['✓ הוגדר',            '✓ Set'],
  'magic.age_group':      ['קבוצת גיל',          'Age Group'],
  'magic.location':       ['מיקום',              'Location'],
  'magic.duration':       ['זמן פנוי',           'Time Available'],
  'magic.energy':         ['רמת אנרגיה',         'Energy Level'],
  'magic.equipment':      ['ציוד זמין',          'Equipment Available'],
  'magic.topics':         ['🏷️ נושאים',          '🏷️ Topics'],
  'magic.submit':         ['✨ הפוך ל-MAGIC',     '✨ Apply MAGIC'],
  'magic.loading.title':  ['מכין משהו מיוחד...', 'Preparing something special...'],
  'magic.loading.sub':    ['ה-MAGIC בדרך',       'MAGIC is on its way'],
  'magic.try_again':      ['← נסה שוב',          '← Try Again'],
  'magic.saved':          ['✅ נשמר לבנק',        '✅ Saved to Bank'],
  'magic.view_bank':      ['צפה בבנק →',         'View in Bank →'],
  'magic.not_saved':      ['לא נשמר לבנק',       'Not saved to bank'],
  'magic.original_task':  ['המשימה המקורית:',    'Original task:'],
  'magic.err.limit':      ['הגעת למגבלת ה-AI היומית. נסה מחר.', 'You reached the daily AI limit. Try again tomorrow.'],
  'magic.err.unavailable':['שירות ה-AI אינו זמין כרגע. נסה שוב מאוחר יותר.', 'AI service is currently unavailable. Try again later.'],
  'magic.err.network':    ['לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט.', 'Cannot connect to server. Check your internet connection.'],
  'magic.err.generic':    ['משהו השתבש. אנא נסה שוב.',       'Something went wrong. Please try again.'],
  // Magic context chip labels (location/duration/energy share with emergency form above)
  'magic.dur.5':   ['5 דק׳',  '5 min'],
  'magic.dur.10':  ['10 דק׳', '10 min'],
  'magic.dur.15':  ['15 דק׳', '15 min'],
  'magic.dur.30':  ['30 דק׳', '30 min'],
  'magic.dur.60':  ['60 דק׳', '60 min'],
  'magic.energy.calm':      ['🔵 שקט',    '🔵 Calm'],
  'magic.energy.medium':    ['🟡 בינוני', '🟡 Medium'],
  'magic.energy.energetic': ['🔴 פראי',   '🔴 High Energy'],

  // ── Activity Bank page ───────────────────────────────────────
  'bank.title':       ['📋 בנק פעילויות',      '📋 Activity Bank'],
  'bank.add':         ['➕ הוסף פעילות',       '➕ Add Activity'],
  'bank.search':      ['חיפוש פעילויות...',   'Search activities...'],
  'bank.all_levels':  ['כל רמות',              'All Levels'],
  'bank.all_locs':    ['כל מקום',              'Any Location'],
  'bank.all_times':   ['כל זמן',              'Any Time'],
  'bank.topics':      ['🏷️ נושאים',           '🏷️ Topics'],
  'bank.clear':       ['נקה סינון',            'Clear Filters'],
  'bank.empty':       ['לא נמצאו פעילויות.',   'No activities found.'],
  'bank.clear_link':  ['נקה סינון',            'Clear filters'],
  // Duration filter labels
  'bank.dur.5':   ['≤5 דק׳',  '≤5 min'],
  'bank.dur.15':  ['≤15 דק׳', '≤15 min'],
  'bank.dur.30':  ['≤30 דק׳', '≤30 min'],
  'bank.dur.60':  ['≤שעה',   '≤1 hr'],

  // ── Add / Edit Activity forms ─────────────────────────────────
  'activity.add.title':    ['➕ הוספת פעילות חדשה',  '➕ Add New Activity'],
  'activity.add.subtitle': ['פעילויות שתוסיפו יהיו זמינות לכל המדריכים באתר מיד לאחר השמירה.', 'Activities you add will be available to all counselors immediately after saving.'],
  'activity.add.back':     ['→ חזור לבנק',          '→ Back to Bank'],
  'activity.edit.title':   ['✏️ עריכת פעילות',      '✏️ Edit Activity'],
  'activity.edit.subtitle':['עדכן את הפרטים ולחץ שמור.', 'Update the details and press Save.'],

  // Section titles
  'activity.sec.hebrew':    ['תוכן בעברית',          'Hebrew Content'],
  'activity.sec.params':    ['פרמטרים בסיסיים',      'Basic Parameters'],
  'activity.sec.topics':    ['נושאים',               'Topics'],
  'activity.sec.equipment': ['ציוד',                 'Equipment'],
  'activity.sec.variations':['וריאציות (עד 2)',       'Variations (up to 2)'],
  'activity.sec.safety':    ['בטיחות ויהדות',        'Safety & Jewish Element'],
  'activity.sec.logistics': ['לוגיסטיקה (אופציונלי)', 'Logistics (optional)'],
  'activity.sec.english':   ['תוכן באנגלית (אופציונלי)', 'English Content (optional)'],
  'activity.sec.variations_short': ['וריאציות',      'Variations'],
  'activity.sec.logistics_short':  ['לוגיסטיקה',    'Logistics'],

  // Field labels
  'activity.field.title_he':         ['שם הפעילות',       'Activity Name'],
  'activity.field.title_he.hint':    ['שם ברור וזכיר שמדריכים יזהו בשנייה', 'A clear, memorable name counselors will recognize instantly'],
  'activity.field.desc_he':          ['תיאור קצר',        'Short Description'],
  'activity.field.desc_he.hint':     ['משפט-שניים שמסביר במה מדובר', 'One or two sentences explaining the activity'],
  'activity.field.instr_he':         ['הוראות הרצה',      'How to Run It'],
  'activity.field.instr_he.hint':    ['פרט שלב-אחר-שלב. כל שלב בשורה נפרדת.', 'Step-by-step. Each step on its own line.'],
  'activity.field.why_he':           ['למה זה עובד',      'Why It Works'],
  'activity.field.why_he.hint':      ['הסבר קצר לפסיכולוגיה / פדגוגיה מאחורי הפעילות (אופציונלי)', 'Brief explanation of the psychology / pedagogy behind the activity (optional)'],
  'activity.field.goal_he':          ['מטרה חינוכית',     'Educational Goal'],
  'activity.field.goal_he.hint':     ['מה ילמדו / יפתחו המשתתפים (אופציונלי)', 'What participants will learn or develop (optional)'],
  'activity.field.duration':         ['משך הפעילות (דקות)', 'Duration (minutes)'],
  'activity.field.energy':           ['רמת אנרגיה',       'Energy Level'],
  'activity.field.location':         ['מיקום',            'Location'],
  'activity.field.age_min':          ['גיל מינימום',      'Min Age'],
  'activity.field.age_max':          ['גיל מקסימום',      'Max Age'],
  'activity.field.group_min':        ['גודל קבוצה — מינ׳', 'Group Size — Min'],
  'activity.field.group_max':        ['גודל קבוצה — מקס׳', 'Group Size — Max'],
  'activity.field.safety':           ['הערות בטיחות',     'Safety Notes'],
  'activity.field.safety.waterfront':['חובה לפעילויות ליד מים', 'Required for waterfront activities'],
  'activity.field.safety.optional':  ['אופציונלי לפעילויות אחרות', 'Optional for other activities'],
  'activity.field.hebrew_el':        ['אלמנט עברי / יהודי', 'Hebrew / Jewish Element'],
  'activity.field.hebrew_el.hint':   ['קשר לשבת, ערכים, עברית, תרבות יהודית (אופציונלי)', 'Connection to Shabbat, values, Hebrew, Jewish culture (optional)'],
  'activity.field.counselors':       ['מספר מדריכים',     'Staff Count'],
  'activity.field.loc_type':         ['סוג מיקום',        'Location Type'],
  'activity.field.coordination':     ['רמת תיאום',        'Coordination Level'],
  'activity.field.title_en':         ['שם באנגלית',       'English Name'],
  'activity.field.desc_en':          ['תיאור באנגלית',    'English Description'],
  'activity.field.instr_en':         ['הוראות באנגלית',   'English Instructions'],
  'activity.field.english_hint':     ['אם לא תמלא, יוצג הטקסט העברי גם בתצוגה האנגלית.', 'If left blank, Hebrew text will be shown in English view too.'],
  'activity.field.equipment_hint':   ['בחר ציוד נפוץ או הוסף ידנית', 'Select common equipment or add manually'],
  'activity.field.equipment_other':  ['ציוד אחר...',      'Other equipment...'],

  // Variation labels
  'activity.variation.label':  ['וריאציה', 'Variation'],
  'activity.variation.name':   ['שם הוריאציה', 'Variation Name'],
  'activity.variation.desc':   ['תיאור קצר של ההבדל מהגרסה המקורית...', 'Brief description of the difference from the original...'],
  'activity.variation.add':    ['+ הוסף וריאציה', '+ Add Variation'],
  'activity.variation.remove': ['הסר',            'Remove'],

  // Energy/location options (shared with forms)
  'activity.energy.calm':      ['🔵 שקט',    '🔵 Calm'],
  'activity.energy.medium':    ['🟡 בינוני', '🟡 Medium'],
  'activity.energy.energetic': ['🔴 פראי',   '🔴 High Energy'],
  'activity.loc.indoor':     ['🏠 בפנים',   '🏠 Indoor'],
  'activity.loc.outdoor':    ['🌳 בחוץ',    '🌳 Outdoor'],
  'activity.loc.waterfront': ['🌊 אגם',     '🌊 Waterfront'],
  'activity.loc.cabin':      ['🛖 צריף',    '🛖 Cabin'],
  'activity.loc.field':      ['⛳ מגרש',    '⛳ Field'],
  'activity.loc.any':        ['📍 כל מקום', '📍 Any Location'],
  'activity.coord.none':        ['✅ ללא תיאום',   '✅ No Coordination'],
  'activity.coord.recommended': ['📋 תיאום מומלץ', '📋 Recommended'],
  'activity.coord.required':    ['⚠️ תיאום נדרש', '⚠️ Required'],

  // Submit / error
  'activity.save':         ['💾 שמור פעילות',  '💾 Save Activity'],
  'activity.save_changes': ['💾 שמור שינויים', '💾 Save Changes'],
  'activity.saving':       ['שומר...',          'Saving...'],

  // Validation errors
  'activity.err.title_he':    ['שם הפעילות בעברית נדרש',     'Activity name is required'],
  'activity.err.desc_he':     ['תיאור קצר בעברית נדרש',      'Short description is required'],
  'activity.err.instr_he':    ['הוראות בעברית נדרשות',       'Instructions are required'],
  'activity.err.duration':    ['משך הפעילות נדרש',           'Duration is required'],
  'activity.err.energy':      ['רמת אנרגיה נדרשת',           'Energy level is required'],
  'activity.err.location':    ['מיקום נדרש',                 'Location is required'],
  'activity.err.safety_wf':   ['פעילות ליד מים חייבת לכלול הערות בטיחות', 'Waterfront activities must include safety notes'],

  // ── Syllabus / Import page ────────────────────────────────────
  'syllabus.title':            ['📄 ייבוא פעילויות',                   '📄 Import Activities'],
  'syllabus.subtitle':         ['העלה קובץ עם פעילויות קיימות → AI מזהה ומבנה → בחר ואשר → שמור לבנק', 'Upload a file with existing activities → AI structures them → Review and approve → Save to Bank'],
  'syllabus.choose_file':      ['לחץ לבחירת קובץ',                    'Tap to choose a file'],
  'syllabus.file_hint':        ['PDF, DOCX, TXT, MD — עד 500KB',      'PDF, DOCX, TXT, MD — up to 500 KB'],
  'syllabus.extract':          ['🔍 זהה פעילויות בקובץ',               '🔍 Find Activities in File'],
  'syllabus.extracting':       ['מזהה פעילויות בקובץ...',              'Finding activities in file...'],
  'syllabus.found':            ['נמצאו {n} פעילויות — בחר אילו לייבא:', '{n} activities found — select which to import:'],
  'syllabus.select_all':       ['בחר הכל',                             'Select All'],
  'syllabus.deselect_all':     ['בטל הכל',                             'Deselect All'],
  'syllabus.import':           ['⬇ ייבא {n} פעילויות לבנק',            '⬇ Import {n} to Bank'],
  'syllabus.importing':        ['שומר פעילויות...',                     'Saving activities...'],
  'syllabus.reset':            ['התחל מחדש',                           'Start Over'],
  'syllabus.done':             ['✅ יובאו {n} פעילויות לבנק!',          '✅ Imported {n} activities to Bank!'],
  'syllabus.new_upload':       ['העלאה חדשה',                          'New Upload'],
  'syllabus.none_found':       ['לא נמצאו פעילויות בקובץ. נסה קובץ אחר.', 'No activities found in this file. Try a different file.'],
  'syllabus.go_bank':          ['📋 עבור לבנק הפעילויות',              '📋 Go to Activity Bank'],
  'syllabus.open':             ['פתח ←',                               'Open ←'],
  // Error strings — specific per failure type
  'syllabus.err.file_type':    ['סוג קובץ לא נתמך. השתמש ב-PDF, DOCX, TXT, או MD.', 'Unsupported file type. Use PDF, DOCX, TXT, or MD.'],
  'syllabus.err.file_size':    ['הקובץ גדול מדי (מקסימום 500KB).',      'File too large (max 500 KB).'],
  'syllabus.err.file_read':    ['לא הצלחנו לקרוא את הקובץ.',           'Could not read the file.'],
  'syllabus.err.ai_unavailable':['יצירת AI אינה זמינה כרגע. בדוק את הגדרות המפתח.', 'AI generation is not available right now.'],
  'syllabus.err.ai_error':     ['שגיאה בעיבוד תוצאות ה-AI. נסה שוב.', 'Error processing AI results. Please try again.'],
  'syllabus.err.save':         ['שגיאה בשמירה לבנק.',                  'Error saving to bank.'],
  'syllabus.err.network':      ['בעיה בחיבור לאינטרנט. בדוק את החיבור ונסה שוב.', 'Connection problem. Check your internet and try again.'],
  'syllabus.err.server':       ['שגיאת שרת. נסה שוב.',                 'Server error. Please try again.'],
  'syllabus.err.truncation':   ['הקובץ הכיל יותר מדי תוכן לעיבוד מלא. נסה קובץ קטן יותר או פחות פעילויות.', 'File had too much content to process fully. Try a smaller file or fewer activities.'],
  'syllabus.has_more':         ['ייתכן שנמצאו פעילויות נוספות בקובץ', 'More activities may exist in this file'],
  'syllabus.chunk_label':      ['חלק {n}',                             'Batch {n}'],
  'syllabus.batch_saved':      ['יובאו {n} פעילויות',                  '{n} activities imported'],
  'syllabus.total_imported':   ['סה״כ יובאו: {n}',                     'Total imported: {n}'],
  'syllabus.import_more':      ['ייבא עוד מהקובץ ←',                   'Import more from file ←'],
  'syllabus.finish':           ['סיים ועבור לבנק',                     'Finish & Go to Bank'],
  'syllabus.skip_chunk':       ['דלג על חלק זה',                       'Skip this batch'],
  'syllabus.no_new':           ['לא נמצאו פעילויות חדשות בחלק זה',     'No new activities found in this batch'],
  // Legacy keys (kept for old extract/generate flow, not primary UX)
  'syllabus.objectives_found': ['נמצאו {n} מטרות — בחר אילו להפוך לפעילויות:', '{n} objectives found — select which to convert:'],
  'syllabus.generate':         ['⚡ צור {n} פעילויות',                  '⚡ Create {n} Activities'],
  'syllabus.generating':       ['יוצר {n} פעילויות...',                 'Creating {n} activities...'],
  'syllabus.time_est':         ['זה עשוי לקחת כ-{n} שניות',            'This may take ~{n} seconds'],
  'syllabus.err.extract':      ['שגיאה בחילוץ מטרות.',                 'Error extracting objectives.'],
  'syllabus.err.generate':     ['שגיאה ביצירת פעילויות.',              'Error generating activities.'],

  // ── Common / shared ───────────────────────────────────────────
  'common.selected': ['נבחרו',   'selected'],
  'common.options':  ['אפשרויות', 'options'],
};

export function t(key: string, lang: Language): string {
  const pair = STRINGS[key];
  if (!pair) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing UI string key: "${key}"`);
    }
    return key;
  }
  return lang === 'en' ? pair[1] : pair[0];
}
