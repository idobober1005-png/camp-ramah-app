-- ============================================================
-- Migration 005 — creator_id + Hebrew element fixes
-- ============================================================

-- 1. Add creator_id to activities (nullable — seed activities stay NULL)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS creator_id TEXT;

-- 2. Update hebrew_element values for seed activities to Hebrew
--    (seed was written in English; these appear in the "✡️ אלמנט עברי" section)

UPDATE activities SET hebrew_element = 'שאלה של היום — שאלה יומית מעוררת מחשבה'
WHERE title = 'שאלה של היום — Question of the Day' AND source = 'manual';

UPDATE activities SET hebrew_element = 'אגם, אוצר מילים עברי'
WHERE title = 'Two Truths and a Lie — Ramah Edition' AND source = 'manual';

UPDATE activities SET hebrew_element = 'צריף, שאלות היסטוריה של מחנה רמה'
WHERE title = 'Tzrif Trivia — Cabin Challenge' AND source = 'manual';

UPDATE activities SET hebrew_element = 'רשימת מילים יהודית/ישראלית, שמות מקומות עבריים'
WHERE title = 'Maccabiah Pictionary' AND source = 'manual';

UPDATE activities SET hebrew_element = 'תרחישים בנושאי עברית וישראל'
WHERE title = 'Would You Rather — Ramah Edition' AND source = 'manual';

UPDATE activities SET hebrew_element = 'מעגל הוקרה, תודה — פרקטיקת הכרת תודה'
WHERE title = 'Appreciation Circle — מעגל הוקרה' AND source = 'manual';

UPDATE activities SET hebrew_element = 'מידות (ערכים יהודיים) — אפשרות מסגרת'
WHERE title = 'Cabin Coat of Arms' AND source = 'manual';

UPDATE activities SET hebrew_element = 'אוצר מילים עברי של מחנה: אגם, צריף, מועדון, חדר אוכל, קבוצה, עדה, בית עם'
WHERE title = 'Hebrew Bingo — מילות מחנה' AND source = 'manual';

UPDATE activities SET hebrew_element = 'שמעון אומר — פעלים עבריים: קום, שב, קפץ, רוץ, מחא כף'
WHERE title = 'Hebrew Simon Says — שמעון אומר' AND source = 'manual';

UPDATE activities SET hebrew_element = 'מה זה? — שמות עצם עבריים לסביבה'
WHERE title = 'Mah Zeh? — What Is This?' AND source = 'manual';

UPDATE activities SET hebrew_element = 'גרסה יהודית זמינה: מכבים, תורה, עם ישראל'
WHERE title = 'Giants, Wizards, Elves' AND source = 'manual';

-- 3. Translate waterfront safety_notes to Hebrew for Hebrew-mode users
UPDATE activities SET safety_notes =
  'בטיחות: אזור המשחק מוגדר ורדוד (עד כדי המותניים לחניכים הצעירים). מינימום מציל אחד בתפקיד פעיל המשגיח רק על פעילות זו. שיטת חברים פעילה. אסור לרוץ על הסיפון או החוף. כל המשתתפים חייבים לעבור את מבחן השחייה הרלוונטי לאזורם.'
WHERE title = 'Waterfront Freeze Tag' AND source = 'manual';

UPDATE activities SET safety_notes =
  'בטיחות: הפעילות מוגבלת לנתיב שחייה מוגדר. מציל ממוקם בנקודת הפנייה הרחוקה. כל המשתתפים חייבים לעבור את מבחן השחייה הרלוונטי. שיטת חברים פעילה לאורך כל הפעילות. המקלונים מיועדים לכיף בלבד — אינם ציוד הצלה.'
WHERE title = 'Noodle Relay Race' AND source = 'manual';

UPDATE activities SET safety_notes =
  'בטיחות: אזור המשחק בתחומי אזור השחייה המוגדר. מציל על הסיפון בפיקוח פעיל (לא המדריך המנהל את המשחק). דרישת דריכת מים: יש לוודא שכל המשתתפים מסוגלים לדרוך מים 15+ שניות לפני תחילת הפעילות. בדיקת חברים לפני תחילת הפעילות.'
WHERE title = 'Waterfront Red Light Green Light' AND source = 'manual';
