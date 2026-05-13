-- ============================================================
-- Camp Ramah Creative Assistant — Seed Activities
-- 22 curated starter activities (source = 'manual')
-- ============================================================

INSERT INTO activities
  (title, description, age_min, age_max, duration_minutes, energy_level,
   location, group_size_min, group_size_max, materials, instructions,
   variations, safety_notes, educational_goal, hebrew_element, tags, source, why_it_works)
VALUES

-- ============================================================
-- TRANSITION / WAITING ACTIVITIES (4)
-- ============================================================

(
  'Freeze Frame',
  'Everyone freezes in a pose when the counselor claps — last one to freeze becomes the next caller.',
  6, 16, 3, 'medium', 'any', 4, 30,
  '[]',
  '1. Explain the rules: everyone moves freely until they hear a clap.
2. On the clap, freeze completely still.
3. The last person to freeze becomes the next clapper.
4. Vary the pace to keep campers on their toes.',
  '[{"name": "Themed Freeze", "description": "Call a theme (''animal'', ''superhero'', ''Shabbat pose'') before clapping — everyone must freeze AS that theme."},
   {"name": "Quiet Version", "description": "Use a raised hand signal instead of a clap for indoor or silent transitions."}]',
  NULL,
  'Listening skills, quick response, impulse control',
  NULL,
  ARRAY['transition','waiting','no-equipment','quick','any-age'],
  'manual',
  'Uses the natural energy of waiting and channels it into a focused listening game. The role-reversal (loser becomes caller) keeps everyone wanting another round.'
),

(
  'שאלה של היום — Question of the Day',
  'The counselor poses one thought-provoking question. Campers answer to a partner or share with the group while transitioning or waiting.',
  8, 18, 5, 'calm', 'any', 2, 30,
  '[]',
  '1. Pose a question aloud: e.g. "If you could add one rule to camp, what would it be?"
2. Give campers 30 seconds to think.
3. Turn to the nearest person and share for 1 minute.
4. Optional: a few volunteers share with the full group.',
  '[{"name": "Hebrew Edition", "description": "Pose the question in Hebrew first, then translate: ''מה היה השיא שלך היום?'' (What was your highlight today?)"},
   {"name": "Jewish Values", "description": "Frame around a middah: ''What did you do today that showed כבוד (respect)?''"}]',
  NULL,
  'Reflection, community building, Hebrew language',
  'שאלה של היום (Question of the Day)',
  ARRAY['transition','reflection','hebrew','connection','calm'],
  'manual',
  'Transforms dead time into meaningful connection. The paired structure ensures every camper speaks, not just the confident ones.'
),

(
  'Human Knot',
  'Everyone stands in a circle, grabs hands across the circle, then untangles into a ring without letting go.',
  8, 16, 10, 'medium', 'any', 6, 16,
  '[]',
  '1. Stand shoulder to shoulder in a tight circle.
2. Each person reaches across and grabs a different person''s hand with each hand (not the person next to you).
3. Without letting go, work together to untangle into a circle.
4. Celebrate success — or laugh at a knot that cannot untangle.',
  '[{"name": "Silent Version", "description": "No talking allowed — pure nonverbal communication. Great for older campers."},
   {"name": "Timed Challenge", "description": "Record the time and try to beat it on the next attempt."}]',
  NULL,
  'Teamwork, communication, problem solving',
  NULL,
  ARRAY['transition','teamwork','no-equipment','problem-solving','bonding'],
  'manual',
  'Physical contact and shared challenge create fast bonds. The puzzle element provides a real goal that requires everyone to cooperate.'
),

(
  'Two Truths and a Lie — Ramah Edition',
  'Each camper shares two true things and one lie about themselves — Ramah-themed for camp context.',
  8, 18, 10, 'calm', 'any', 4, 20,
  '[]',
  '1. Each person thinks of two true things and one lie.
2. Encourage Ramah-themed statements: "I swam across the agam," "I know 10 Hebrew words," "I have been to Israel."
3. Take turns sharing — the group guesses which is the lie.
4. The person reveals the lie and explains the truths.',
  '[{"name": "Counselor Goes First", "description": "Counselor models with their own example to lower anxiety and set the tone."},
   {"name": "Written Round", "description": "Everyone writes their three statements on a paper. Collect, read aloud anonymously, and group guesses who it is."}]',
  NULL,
  'Community building, get-to-know-you, storytelling',
  'agam (lake), Hebrew vocabulary',
  ARRAY['transition','icebreaker','connection','calm','any-age'],
  'manual',
  'Low stakes, high engagement. The guessing game structure ensures the whole group is actively listening to each person.'
),

-- ============================================================
-- RAINY DAY / INDOOR ACTIVITIES (4)
-- ============================================================

(
  'Tzrif Trivia — Cabin Challenge',
  'A team trivia game where each cabin or small group competes across categories: Jewish knowledge, camp knowledge, general fun.',
  8, 16, 30, 'medium', 'indoor', 8, 40,
  '["Paper for scorekeeping", "Optional: whiteboard or flip chart"]',
  '1. Divide into teams of 4–6.
2. Choose a scorekeeper.
3. Read questions in rotating categories: Israel/Hebrew, Ramah history, pop culture, silly camp questions.
4. Teams discuss quietly then call out their answer.
5. First correct answer scores a point.
6. After 15 questions, tally scores and celebrate.',
  '[{"name": "Hebrew Round", "description": "Add a full Hebrew category: translate words, name Hebrew months, identify Jewish holidays."},
   {"name": "Camper-Written", "description": "Give teams 5 minutes to write 2 questions each — then swap and answer each other''s questions."}]',
  NULL,
  'Jewish knowledge, Israel literacy, camp community',
  'tzrif (cabin), Ramah history questions',
  ARRAY['indoor','rainy-day','trivia','jewish-education','team','medium-energy'],
  'manual',
  'Competition activates engagement even in a passive setting. Mixing categories ensures every camper has a moment to shine in their area of knowledge.'
),

(
  'Collaborative Storytelling — One Word at a Time',
  'The group builds a story together, each person adding exactly one word at a time, with hilarious results.',
  8, 18, 15, 'calm', 'indoor', 4, 25,
  '[]',
  '1. Sit or stand in a circle.
2. The counselor starts: "Once..."
3. Each person adds exactly one word, going around the circle.
4. No planning, no rejecting words — say yes to everything.
5. After 2–3 minutes, end with "...The End!"
6. Optional: a scribe writes it down to read back.',
  '[{"name": "Theme Edition", "description": "Set a genre before starting: ''This must be a Jewish fairy tale'' or ''This story takes place at camp Ramah.''"},
   {"name": "Sentence Version", "description": "Each person adds one full sentence instead of one word — better for younger campers."}]',
  NULL,
  'Creativity, listening, improv, acceptance ("yes, and")',
  NULL,
  ARRAY['indoor','rainy-day','creativity','improv','calm','storytelling'],
  'manual',
  'Pure improvisation with zero preparation required. The one-word constraint forces listening and makes the story delightfully chaotic.'
),

(
  'Maccabiah Pictionary',
  'Team drawing game with Jewish, Israeli, and camp-themed word lists.',
  8, 16, 25, 'medium', 'indoor', 6, 30,
  '["Paper or whiteboard per team", "Markers or pens", "Word list (included in variations)"]',
  '1. Divide into 2–4 teams.
2. One artist per round gets a word (whispered or shown on a card).
3. The artist draws — no letters, numbers, or speaking.
4. Team has 60 seconds to guess.
5. Correct guess = 1 point. Rotate artists each round.',
  '[{"name": "Hebrew Words", "description": "Use Hebrew vocabulary as the word list: shabbat, menorah, kibbutz, agam, tzrif, etc."},
   {"name": "Camp Locations", "description": "Draw camp locations: chadar ochel, agam, beit am, moadon, tzrif — teams guess the Hebrew name."}]',
  NULL,
  'Hebrew vocabulary, Jewish culture, creative expression',
  'Jewish/Israeli themed word list, Hebrew place names',
  ARRAY['indoor','rainy-day','drawing','hebrew','team','medium-energy'],
  'manual',
  'Pictionary is universally loved. The Jewish/Hebrew theming makes it educational without feeling like a lesson.'
),

(
  'Newspaper Fashion Show',
  'Teams are given newspaper and tape and must design an outfit in 10 minutes, then model it on a runway.',
  10, 18, 20, 'energetic', 'indoor', 6, 30,
  '["Newspaper (several pages per team)", "Masking tape", "Optional: music for the runway"]',
  '1. Divide into teams of 3–5.
2. Give each team newspaper and tape.
3. They have 10 minutes to create a wearable outfit for one team member.
4. Everyone walks the runway and presents their design with a name and description.
5. Group votes on categories: most creative, most wearable, funniest.',
  '[{"name": "Jewish Holiday Theme", "description": "Each team makes an outfit inspired by a Jewish holiday: Purim costume, Shabbat queen outfit, etc."},
   {"name": "Runway Commentary", "description": "Counselor narrates the runway like a fashion show announcer to build energy."}]',
  NULL,
  'Creativity, teamwork, self-expression',
  NULL,
  ARRAY['indoor','rainy-day','creative','team','energetic','no-equipment-beyond-basics'],
  'manual',
  'Cheap materials + time pressure + a clear goal = maximum creativity. The runway gives everyone a moment of visibility.'
),

-- ============================================================
-- CABIN BONDING GAMES (4)
-- ============================================================

(
  'Desert Island',
  'Each camper chooses 3 items to bring to a desert island and explains why — reveals personality and sparks deep conversation.',
  8, 18, 15, 'calm', 'cabin', 4, 16,
  '[]',
  '1. Pose the scenario: "You are stranded alone on a desert island for one year. You can bring exactly 3 items."
2. Give 2 minutes for everyone to think.
3. Go around the circle — each person shares their 3 items and reasons.
4. Ask follow-up questions and celebrate surprising choices.',
  '[{"name": "Jewish Edition", "description": "Add the constraint: one of the 3 items must be related to Jewish life or identity."},
   {"name": "Debate Version", "description": "After everyone shares, debate: whose survival setup is best? Who would last the longest?"}]',
  NULL,
  'Self-expression, values clarification, community building',
  NULL,
  ARRAY['cabin','bonding','calm','reflection','any-age','no-equipment'],
  'manual',
  'Simple premise that reveals genuine personality. The "why" explanations turn a party game into a real window into who someone is.'
),

(
  'Would You Rather — Ramah Edition',
  'Fast-paced preference game with camp, Jewish, and Israel-themed scenarios that spark conversation.',
  8, 18, 10, 'medium', 'cabin', 4, 20,
  '[]',
  '1. Counselor poses a "Would you rather..." question.
2. Campers physically split: left side of the room = option A, right = option B.
3. A few people explain their choice — no judgment.
4. Continue with new questions.

Sample questions:
- Would you rather have Shabbat every day or no Shabbat ever?
- Would you rather be a counselor or a camper forever?
- Would you rather live in Israel or New York?
- Would you rather speak only Hebrew or only English for a week?',
  '[{"name": "Camper-Written", "description": "After a few rounds, let campers write their own Ramah-themed Would You Rathers."},
   {"name": "Debate Mode", "description": "Two volunteers debate the options for 30 seconds before the group votes."}]',
  NULL,
  'Values exploration, community building, Jewish identity',
  'Hebrew and Israel-themed scenarios',
  ARRAY['cabin','bonding','medium-energy','discussion','jewish-identity','no-equipment'],
  'manual',
  'Physical movement (splitting into groups) keeps energy alive. The Ramah theming makes it feel specific and meaningful to camp identity.'
),

(
  'Appreciation Circle — מעגל הוקרה',
  'Campers share a genuine compliment or appreciation for the person to their left. Ends with the whole group feeling seen.',
  8, 18, 10, 'calm', 'cabin', 4, 20,
  '[]',
  '1. Sit in a circle.
2. Explain: "We''re going to say something genuine and specific we appreciate about the person to our left."
3. Give 1 minute for everyone to think.
4. Go around the circle — each person shares their appreciation.
5. No interrupting. Just receive.
6. End with a group moment: everyone says "Todah! (תודה)" together.',
  '[{"name": "Written Version", "description": "Write appreciations on sticky notes and place them on each person''s back or chair."},
   {"name": "End-of-Session Ritual", "description": "Use this as a closing ritual at the end of every weekly cabin meeting."}]',
  NULL,
  'Emotional intelligence, gratitude, positive community culture',
  'מעגל הוקרה (Appreciation Circle), תודה (thank you)',
  ARRAY['cabin','bonding','calm','reflection','hebrew','emotional-intelligence','shabbat-appropriate'],
  'manual',
  'Specificity is the secret: "something genuine and specific" forces real observation rather than generic flattery. Creates a moment of genuine vulnerability and connection.'
),

(
  'Cabin Coat of Arms',
  'The cabin collaborates to design their group coat of arms — representing their shared values, inside jokes, and identity.',
  8, 16, 30, 'calm', 'cabin', 4, 12,
  '["Paper per team (large)", "Markers or colored pencils"]',
  '1. Give each group a large sheet of paper.
2. Draw a shield divided into 4 sections.
3. As a group, agree on what goes in each section:
   - Top left: Something we all have in common
   - Top right: Our biggest challenge we overcame
   - Bottom left: Something that makes our cabin unique
   - Bottom right: Our cabin motto or value
4. Decorate and present to other cabins.',
  '[{"name": "Jewish Values Frame", "description": "Each quadrant represents a middah (Jewish value) the cabin wants to embody."},
   {"name": "Digital Version", "description": "For older campers, create it collaboratively in Canva or on a shared whiteboard."}]',
  NULL,
  'Identity, community building, Jewish values, teamwork',
  'Middot (Jewish values) framing option',
  ARRAY['cabin','bonding','creative','calm','identity','jewish-values'],
  'manual',
  'Creating something together builds ownership. The coat of arms becomes a physical artifact of group identity that can be displayed for the summer.'
),

-- ============================================================
-- HEBREW LEARNING ACTIVITIES (3)
-- ============================================================

(
  'Hebrew Bingo — מילות מחנה',
  'Bingo with Hebrew camp vocabulary — campers hear the English or Hebrew word and mark the corresponding word on their card.',
  6, 14, 20, 'medium', 'any', 8, 40,
  '["Bingo cards (1 per camper)", "Markers or coins as chips", "Word caller cards"]',
  '1. Distribute bingo cards with Hebrew camp words (agam, tzrif, moadon, chadar ochel, kvutza, etc.).
2. Caller reads words in either Hebrew OR English.
3. Campers find and mark the matching word on their card.
4. First to complete a row calls "BINGO!" and reads back their words.
5. Verify and award a small prize or group celebration.',
  '[{"name": "Images Edition", "description": "Use pictures instead of words on the cards — campers hear the Hebrew word and find the picture."},
   {"name": "Counselor Battle", "description": "Counselors compete against campers — campers love beating their counselors."}]',
  NULL,
  'Hebrew vocabulary, camp vocabulary, listening comprehension',
  'Full Hebrew vocabulary: agam, tzrif, moadon, chadar ochel, kvutza, edah, beit am',
  ARRAY['hebrew','education','any-location','medium-energy','game','language'],
  'manual',
  'Bingo format reduces anxiety around language learning. The stakes are low and the repetition of hearing words builds passive vocabulary automatically.'
),

(
  'Hebrew Simon Says — שמעון אומר',
  'Classic Simon Says — all commands given in Hebrew. Campers learn action verbs in context through physical movement.',
  6, 14, 10, 'energetic', 'any', 6, 40,
  '[]',
  '1. Teach 6–8 Hebrew action words first: קום (stand up), שב (sit), קפץ (jump), רוץ (run in place), מחא כף (clap), שכב (lie down).
2. Play Simon Says using only those Hebrew commands.
3. "שמעון אומר קום" = do it. "קום" without "שמעון אומר" = don''t move.
4. Gradually add harder vocab as the game continues.',
  '[{"name": "Body Parts Version", "description": "Commands include body part words: גע בראש (touch your head), גע בברך (touch your knee)."},
   {"name": "Reverse Mode", "description": "Older campers: do the OPPOSITE of the command — requires active translation and thinking."}]',
  NULL,
  'Hebrew action verbs, listening comprehension, physical coordination',
  'שמעון אומר, Hebrew action verbs: קום, שב, קפץ, רוץ, מחא כף',
  ARRAY['hebrew','education','energetic','movement','language','any-location','any-age'],
  'manual',
  'Total Physical Response (TPR) is one of the most effective language learning methods — linking movement to words creates strong memory hooks without conscious effort.'
),

(
  'Mah Zeh? — What Is This?',
  'Counselor points to objects around the space. Campers race to call out the Hebrew word. First correct answer wins the point.',
  8, 14, 10, 'medium', 'any', 4, 30,
  '[]',
  '1. Review 10–15 Hebrew vocabulary words that match objects in the environment (shulchan = table, kiseh = chair, chalon = window, delet = door, sefer = book).
2. Counselor rapidly points to objects and calls "מה זה?" (Mah zeh? = What is this?)
3. First camper to call out the correct Hebrew word scores a point.
4. After 10 rounds, the highest scorer gets to be the caller.',
  '[{"name": "Team Version", "description": "Teams confer before answering — slower but builds collaboration."},
   {"name": "Body Round", "description": "Point to body parts instead of room objects for a different vocabulary set."}]',
  NULL,
  'Hebrew noun vocabulary, fast recall, listening',
  'מה זה? (What is this?), Hebrew nouns for environment',
  ARRAY['hebrew','education','medium-energy','vocabulary','quick','any-location'],
  'manual',
  'Speed creates adrenaline that boosts memory retention. The kinesthetic element (pointing) grounds abstract words in concrete reality.'
),

-- ============================================================
-- WATERFRONT WARM-UPS (3)
-- ============================================================

(
  'Waterfront Freeze Tag',
  'Classic freeze tag adapted for shallow water — frozen players stand with hands up until tagged free by a teammate.',
  8, 16, 10, 'energetic', 'waterfront', 6, 25,
  '[]',
  '1. Designate a clear shallow-water play zone (waist-deep maximum).
2. Choose 1–2 "it" players.
3. Tagged players freeze in place with arms up.
4. Free players can unfreeze frozen teammates by swimming under their arms.
5. Game ends when all players are frozen, or after a set time limit.',
  '[{"name": "Deep Water Version", "description": "For strong swimmers in a designated zone: frozen players float on their backs until freed by a teammate touching their hand. REQUIRES extra lifeguard supervision."},
   {"name": "Noodle Tag", "description": "''It'' carries a pool noodle to tag — reduces contact and keeps it clearly fair."}]',
  'SAFETY: Play area must be clearly marked and shallow (waist-deep for youngest campers). Minimum 1 lifeguard on active duty watching only this activity. Buddy system active. No running on deck or shore. All participants must have passed swim test for their zone.',
  'Swimming comfort, teamwork, following waterfront rules',
  NULL,
  ARRAY['waterfront','warm-up','energetic','team','swimming','agam'],
  'manual',
  'Converts an anxious "get in the water" moment into a game campers are excited to join. The unfreeze mechanic ensures campers are actively helping each other.'
),

(
  'Noodle Relay Race',
  'Teams race across the pool or marked waterfront zone balancing a pool noodle between their knees — no hands.',
  8, 16, 15, 'energetic', 'waterfront', 8, 30,
  '["Pool noodles (1 per team)", "Lane markers or buoys"]',
  '1. Set up a clear start and finish line within a designated zone.
2. Divide into teams of 4–6.
3. First swimmer must hold the noodle between their knees — no hands.
4. Touch the far wall or buoy and return.
5. Pass the noodle to the next person.
6. First team to finish wins.',
  '[{"name": "Pairs Version", "description": "Two campers share one noodle between them — they must both hold it and swim together."},
   {"name": "Obstacle Course", "description": "Add floating markers to swim around before returning."}]',
  'SAFETY: Activity confined to designated lane. Lifeguard positioned at the far turn point. All participants must pass relevant swim test. Buddy system active throughout. Noodles are for fun only — not personal flotation devices.',
  'Swim technique, coordination, team competition',
  NULL,
  ARRAY['waterfront','warm-up','energetic','relay','swimming','equipment'],
  'manual',
  'Noodles reduce intimidation for less confident swimmers while the relay format creates team cheering that builds waterfront community quickly.'
),

(
  'Waterfront Red Light Green Light',
  'Classic game played in the water — counselor calls "green light" (swim) or "red light" (stop and tread water). First to the counselor wins.',
  6, 14, 10, 'medium', 'waterfront', 6, 20,
  '[]',
  '1. All campers start at one end of the designated swim zone.
2. Counselor stands at the other end.
3. "Green light" = swim forward. "Red light" = stop immediately and tread water.
4. Anyone still moving on red light goes back to the start.
5. First to reach the counselor wins and becomes the next caller.',
  '[{"name": "Underwater Version", "description": "On green light, campers must swim underwater for 3 seconds before surfacing — tests breath control."},
   {"name": "Kickboard Version", "description": "All swimmers use kickboards — great for younger or less confident swimmers."}]',
  'SAFETY: Play area fully within designated swim zone. Lifeguard on active deck supervision (not the counselor running the game). Treading water requirement means all participants must be able to tread for 15+ seconds — confirm this before starting. Buddy check before activity begins.',
  'Treading water, listening skills, swim confidence',
  NULL,
  ARRAY['waterfront','warm-up','medium-energy','swimming','classic','any-age'],
  'manual',
  'Zero setup, instantly familiar. The treading water requirement naturally builds an essential safety skill while feeling like pure play.'
),

-- ============================================================
-- QUICK OUTDOOR / LOW-MATERIAL GAMES (4)
-- ============================================================

(
  'Ninja',
  'Campers stand in a circle and try to slap each other''s hands. Move in one fluid motion per turn — no mid-move adjustments.',
  8, 18, 15, 'energetic', 'outdoor', 5, 20,
  '[]',
  '1. Stand in a circle, all touching hands in the center.
2. On "3-2-1-NINJA!" everyone jumps back into a ninja pose.
3. Taking turns clockwise, each player makes ONE fluid motion to try to slap any other player''s hand.
4. The target may move ONE fluid motion to dodge.
5. If your hand is slapped, you''re out. Last one standing wins.',
  '[{"name": "Team Ninja", "description": "Two teams — you may only target the opposing team. Last team with members standing wins."},
   {"name": "Counselor Handicap", "description": "Counselors play with one hand behind their back — campers love the advantage."}]',
  NULL,
  'Coordination, reaction time, strategic thinking',
  NULL,
  ARRAY['outdoor','energetic','field','no-equipment','competitive','any-age'],
  'manual',
  'Ninja spreads virally through camps because it feels both physical and strategic. The one-motion rule creates dramatic slow-motion action that is as fun to watch as to play.'
),

(
  'Giants, Wizards, Elves',
  'A full-body Rock-Paper-Scissors variant played in two teams that run toward each other after choosing their character.',
  8, 16, 15, 'energetic', 'outdoor', 10, 60,
  '[]',
  '1. Teach the three characters: Giant (arms up, roar), Wizard (point wand, say "zap"), Elf (hands on ears, squeak). Giants beat Elves, Wizards beat Giants, Elves beat Wizards.
2. Divide into two equal teams.
3. Teams huddle and choose their character secretly.
4. Both teams approach each other. On the count of 3, everyone acts out their character.
5. The losing team runs back to their safe zone. The winning team chases to tag as many as possible before they reach safety.
6. Tagged players join the winning team. Play until one team has everyone.',
  '[{"name": "Jewish Version", "description": "Rename: Maccabees (warriors), Torah (wisdom), Am Yisrael (people). Torah beats Maccabees (wisdom guides warriors), Am Yisrael beats Torah (people bring Torah to life), Maccabees beats Am Yisrael (protection). Discuss the symbolism afterward."},
   {"name": "Silent Round", "description": "Characters must be acted silently — no sound effects. Tests physical expression."}]',
  NULL,
  'Team strategy, physical activity, decision making under pressure',
  'Jewish values variant available',
  ARRAY['outdoor','energetic','field','large-group','team','no-equipment','running'],
  'manual',
  'The chase after the reveal creates adrenaline that standard Rock-Paper-Scissors cannot. Large group format means the stakes feel high and every round has energy.'
),

(
  'Hula Hoop Pass',
  'The group holds hands in a circle and must pass a hula hoop around the entire circle without breaking handhold.',
  6, 14, 10, 'medium', 'outdoor', 8, 30,
  '["1–2 hula hoops"]',
  '1. Stand in a circle, hold hands.
2. Place a hula hoop over one person''s arm so it hangs on the joined hands.
3. The hoop must travel all the way around the circle — everyone must step through it — without anyone breaking the handhold.
4. Time it, then try to beat your record.',
  '[{"name": "Two Hoops", "description": "Start two hoops at opposite sides of the circle, traveling in opposite directions — they must pass each other."},
   {"name": "Blindfolded Pairs", "description": "Alternate: one person in each pair is blindfolded and their partner must guide them through verbally."}]',
  NULL,
  'Teamwork, coordination, communication',
  NULL,
  ARRAY['outdoor','medium-energy','team','equipment','coordination','any-age'],
  'manual',
  'One cheap prop creates a memorable cooperation challenge. The timed element makes every group want to try again to beat their score.'
),

(
  'Camouflage',
  'One counselor counts while campers hide in plain sight — but everyone must stay within eyeshot of the counter at all times.',
  8, 16, 20, 'energetic', 'outdoor', 5, 25,
  '[]',
  '1. Choose a "seeker" — usually a counselor for the first round.
2. Define the play boundaries (all hiders must stay within a certain radius — usually 30 meters).
3. Seeker closes eyes and counts to 30.
4. Hiders find spots in the natural environment — but they must be able to SEE the seeker at all times.
5. Seeker opens eyes and WITHOUT MOVING from their spot, calls out anyone they can see by description.
6. Called players sit out. Seeker counts again and can slowly walk toward remaining hiders.
7. Last one found wins.',
  '[{"name": "Night Edition", "description": "Played at dusk with a flashlight — seeker shines the beam instead of looking. Creates a completely different atmosphere."},
   {"name": "Role Swap Every Round", "description": "Winner of each round becomes the next seeker — keeps the game moving."}]',
  NULL,
  'Observation, patience, strategy, connection with nature',
  NULL,
  ARRAY['outdoor','energetic','field','nature','strategy','any-age'],
  'manual',
  'Camouflage rewards patience and creative thinking over athletic ability — gives different campers a chance to win. The "must stay in eyeshot" rule keeps it safe and tense.'
);
