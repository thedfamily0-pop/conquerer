/**
 * CAPS-Aligned Annual Teaching Plan (ATP) — Grade 3, Term 3
 * 
 * Sources: DBE CAPS Foundation Phase documents, 2023/24 & 2025/26 ATPs
 * Subjects covered:
 *   - Mathematics
 *   - English Home Language
 *   - Afrikaans First Additional Language
 *   - Life Skills (Creative Arts — Visual Arts & Performing Arts, Physical Education)
 *   - Coding & Robotics (Draft CAPS pilot)
 *
 * Term 3 typically runs 10 weeks (±50 school days).
 * Each week entry includes: CAPS content area, specific topics, learning outcomes,
 * suggested activities, and assessment focus aligned to the ATP.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (re-exported from term4ATP for consistency)
// ─────────────────────────────────────────────────────────────────────────────

import type { ATPWeekEntry, ATPSubjectPlan } from './term4ATP';

export interface Term3ATPData {
  grade: number;
  term: number;
  year: number;
  subjects: ATPSubjectPlan[];
}


// ─────────────────────────────────────────────────────────────────────────────
// MATHEMATICS — Grade 3 Term 3
// CAPS Content Areas: Numbers, Operations & Relationships; Patterns, Functions
// & Algebra; Space & Shape; Measurement; Data Handling
// Number range: 0–800 (consolidation), extending to 900
// ─────────────────────────────────────────────────────────────────────────────

export const MATHS_TERM3: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Whole Numbers — Counting, Ordering & Place Value (0–800)',
    learningOutcomes: [
      'Count forwards and backwards in 2s, 3s, 5s, 10s, 25s, 50s, and 100s between 0 and 800',
      'Recognise, identify and read number symbols 0–800',
      'Write number symbols and number names 0–800',
      'Order and compare whole numbers to 800 using <, > and =',
      'Describe and order numbers according to place value (hundreds, tens, ones)',
      'Decompose 3-digit numbers: e.g. 637 = 600 + 30 + 7',
    ],
    activities: [
      'Number line jumps — fill in missing numbers on a number line (counting in 50s and 100s)',
      'Place value cups — stack cups with H, T, O to build 3-digit numbers',
      'Ordering challenge — arrange number cards from smallest to greatest (up to 800)',
      'Expanded notation station — decompose numbers using place value charts',
    ],
    assessmentFocus: 'Oral counting assessment; written place value activity',
    capsReference: 'CAPS Mathematics FP p.118–120; ATP Term 3 Week 1',
  },
  {
    week: 2,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Addition & Subtraction (3-digit numbers, various strategies)',
    learningOutcomes: [
      'Add up to 800 using breaking down, building up and number line strategies',
      'Subtract from numbers up to 800 using various strategies',
      'Solve addition and subtraction problems involving money (rands and cents)',
      'Solve context (word) problems involving addition and subtraction',
      'Check solutions using inverse operations and estimation',
    ],
    activities: [
      'Tuck shop problems — calculate change from R100 or R200 notes',
      'Strategy showcase — learners explain their preferred method to the class',
      'Number line hop — illustrate subtraction as finding the difference',
      'Mental maths warm-up — daily 5-minute addition/subtraction drill',
    ],
    assessmentFocus: 'Written test: addition and subtraction with 3-digit numbers',
    capsReference: 'CAPS Mathematics FP p.121–124; ATP Term 3 Week 2',
  },
  {
    week: 3,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Multiplication (×2, ×3, ×4, ×5, ×10) — Building fluency',
    learningOutcomes: [
      'Know multiplication tables for 2, 3, 4, 5, and 10',
      'Use repeated addition, arrays and groups to solve multiplication',
      'Multiply a 2-digit number by a 1-digit number using breaking down',
      'Solve context problems involving multiplication (equal groups, arrays)',
      'Recognise multiplication as commutative: 3 × 4 = 4 × 3',
    ],
    activities: [
      'Times tables speed test — timed recall of 2×, 3×, 4×, 5×, 10× facts',
      'Array city — draw arrays for multiplication facts on grid paper',
      'Breaking down method — e.g. 23 × 4 = (20 × 4) + (3 × 4)',
      'Multiplication stories — write word problems for given number sentences',
    ],
    assessmentFocus: 'Multiplication fact fluency test; word problem solving',
    capsReference: 'CAPS Mathematics FP p.125–127; ATP Term 3 Week 3',
  },
  {
    week: 4,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Division (÷2, ÷3, ÷4, ÷5, ÷10) — Grouping & Sharing',
    learningOutcomes: [
      'Divide numbers up to 80 by 2, 3, 4, 5, and 10 with and without remainders',
      'Understand division as equal sharing and as grouping',
      'Use multiplication facts to solve division (inverse relationship)',
      'Solve context problems involving equal sharing and grouping',
      'Write remainders appropriately: 13 ÷ 4 = 3 remainder 1',
    ],
    activities: [
      'Sharing station — physically divide counters into equal groups',
      'Division and multiplication fact families — write all 4 related facts',
      'Remainder puzzles — which numbers divide exactly by 5? Which leave remainders?',
      'Word problems — divide stickers, sweets, pencils among children',
    ],
    assessmentFocus: 'Division assessment: calculations with and without remainders',
    capsReference: 'CAPS Mathematics FP p.128–130; ATP Term 3 Week 4',
  },
  {
    week: 5,
    subject: 'Mathematics',
    capsContentArea: 'Measurement',
    topic: 'Time — Analogue & Digital, Calendars & Duration',
    learningOutcomes: [
      'Read time on analogue clock: hours, half hours, quarter hours, and 5-minute intervals',
      'Read time on a digital clock and match to analogue',
      'Calculate duration of events in hours and minutes',
      'Read a calendar: days, weeks, months, dates, events',
      'Solve problems involving time (timetables, daily routines)',
    ],
    activities: [
      'Clock workshop — set geared clocks to given times (analogue practice)',
      'Digital match-up — match digital displays to analogue clock faces',
      'Duration challenge — calculate how long activities take (start and end times)',
      'Calendar questions — answer questions about a given monthly calendar',
    ],
    assessmentFocus: 'Practical: reading clocks; written: time duration problems',
    capsReference: 'CAPS Mathematics FP p.141–144; ATP Term 3 Week 5',
  },
  {
    week: 6,
    subject: 'Mathematics',
    capsContentArea: 'Measurement',
    topic: 'Length — Metres, Centimetres & Millimetres',
    learningOutcomes: [
      'Estimate, measure and compare lengths using metres, centimetres and millimetres',
      'Know the relationships: 1 m = 100 cm; 1 cm = 10 mm',
      'Use a ruler and metre stick to measure objects accurately',
      'Solve problems involving length in context (distance, height, perimeter)',
      'Convert between metres and centimetres in simple cases',
    ],
    activities: [
      'Measurement hunt — measure classroom objects in cm and mm',
      'Metre challenge — estimate and measure distances in metres (playground)',
      'Body measurements — measure height, arm span, hand span and record',
      'Conversion practice — express lengths in different units (2 m = 200 cm)',
    ],
    assessmentFocus: 'Practical measurement task: length (ruler and metre stick)',
    capsReference: 'CAPS Mathematics FP p.145–147; ATP Term 3 Week 6',
  },
  {
    week: 7,
    subject: 'Mathematics',
    capsContentArea: 'Space & Shape',
    topic: '2-D Shapes — Properties, Symmetry & Perimeter',
    learningOutcomes: [
      'Recognise and name 2-D shapes: circle, triangle, square, rectangle, pentagon, hexagon',
      'Describe 2-D shapes by number of sides, corners (vertices) and lines of symmetry',
      'Identify lines of symmetry in shapes and pictures',
      'Calculate perimeter of squares and rectangles by adding side lengths',
      'Draw 2-D shapes on grid paper',
    ],
    activities: [
      'Shape properties chart — complete a table: name, sides, corners, symmetry lines',
      'Symmetry art — fold and cut paper shapes to create symmetrical designs',
      'Perimeter walk — measure sides of objects and calculate total perimeter',
      'Geoboard shapes — make shapes on geoboards and describe properties',
    ],
    assessmentFocus: 'Shape properties worksheet; perimeter calculations',
    capsReference: 'CAPS Mathematics FP p.148–150; ATP Term 3 Week 7',
  },
  {
    week: 8,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Common Fractions — Halves, Quarters, Thirds, Fifths, Sixths, Eighths',
    learningOutcomes: [
      'Use and name fractions in familiar contexts: halves, quarters, thirds, fifths, sixths, eighths',
      'Recognise fractions as equal parts of a whole',
      'Compare fractions with the same denominator',
      'Recognise equivalence: ½ = 2/4 = 4/8',
      'Solve problems involving equal sharing leading to fractions',
    ],
    activities: [
      'Fraction strips — fold paper strips to show halves, quarters, eighths and compare',
      'Pizza sharing — divide circular "pizzas" into equal parts and name fractions',
      'Equivalent fraction wall — build a wall showing which fractions are equal',
      'Sharing problems — "3 children share 2 pies equally" — what does each get?',
    ],
    assessmentFocus: 'Fractions worksheet: naming, comparing, and equivalent fractions',
    capsReference: 'CAPS Mathematics FP p.133–136; ATP Term 3 Week 8',
  },
  {
    week: 9,
    subject: 'Mathematics',
    capsContentArea: 'Data Handling',
    topic: 'Collecting, Sorting & Representing Data',
    learningOutcomes: [
      'Collect data using simple surveys and tallying',
      'Sort, organise and record data using tally marks and frequency tables',
      'Draw pictographs where one symbol represents one or two items',
      'Draw bar graphs with appropriate labels and title',
      'Answer questions about data: most, least, difference, total',
    ],
    activities: [
      'Class survey — collect data about favourite fruits/sports, record using tallies',
      'Pictograph poster — represent data as a pictograph (key: 1 picture = 2 items)',
      'Bar graph builder — draw a bar graph from collected survey data',
      'Data detective — answer 5 questions from a given graph (most, least, how many more)',
    ],
    assessmentFocus: 'Data handling task: collect, represent and interpret data (SBA)',
    capsReference: 'CAPS Mathematics FP p.155–158; ATP Term 3 Week 9',
  },
  {
    week: 10,
    subject: 'Mathematics',
    capsContentArea: 'Patterns, Functions & Algebra / Consolidation',
    topic: 'Number Patterns, Consolidation & Mid-Year Assessment',
    learningOutcomes: [
      'Identify, describe and extend number patterns (addition and subtraction patterns)',
      'Create own number patterns and describe the rule',
      'Consolidate all Term 3 content: operations, time, length, fractions, shapes, data',
      'Complete Term 3 formal assessment (SBA)',
    ],
    activities: [
      'Pattern puzzles — find the rule and extend sequences (e.g. +3, +5, ×2)',
      'Create a pattern — design your own number pattern and challenge a partner',
      'Revision stations — rotate through topic stations for guided practice',
      'Term 3 formal assessment preparation — practice papers',
    ],
    assessmentFocus: 'Term 3 Formal Assessment Task (SBA)',
    capsReference: 'CAPS Mathematics FP p.137–138; ATP Term 3 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH HOME LANGUAGE — Grade 3 Term 3
// CAPS Content Areas: Listening & Speaking; Reading & Phonics; Writing;
// Language Structure & Use
// ─────────────────────────────────────────────────────────────────────────────

export const ENGLISH_HL_TERM3: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'English Home Language',
    capsContentArea: 'Listening & Speaking / Reading & Phonics',
    topic: 'Instructions & Procedures — Listening, Reading & Following',
    learningOutcomes: [
      'Listen to a set of instructions and carry them out in the correct order',
      'Read procedural texts (recipes, rules, craft instructions) and identify steps',
      'Use sequence words: first, next, then, after that, finally',
      'Identify the features of an instructional text (title, materials, numbered steps)',
      'Use phonics to decode words with consonant blends (bl, br, cl, cr, dr, fl, fr, gl, gr)',
    ],
    activities: [
      'Follow the recipe — listen to oral instructions to make a sandwich (sequencing)',
      'Procedure reading — read a craft instruction text and identify title, materials, steps',
      'Sequence card sort — arrange jumbled instruction steps in the correct order',
      'Phonics blends — sort words into blend groups and read them aloud',
    ],
    assessmentFocus: 'Oral: follow instructions accurately; reading: identify procedural features',
    capsReference: 'CAPS English HL FP p.28–30; ATP Term 3 Week 1',
  },
  {
    week: 2,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Language Structure & Use',
    topic: 'Procedural Writing & Giving Instructions',
    learningOutcomes: [
      'Write a simple procedure with a title, list of materials, and numbered steps',
      'Use command verbs (imperative) at the start of each step: cut, mix, fold, draw',
      'Use time connectives to order steps: first, then, next, after that, finally',
      'Use capital letters and full stops correctly in instructional writing',
      'Give clear oral instructions for a simple task (3–5 steps)',
    ],
    activities: [
      'How to make… — write a procedure for making a favourite food or craft',
      'Verb sort — identify and underline command verbs in instruction texts',
      'Oral instructions — give a partner 5 steps to draw a picture (barrier game)',
      'Editing station — proofread a procedure for missing capitals and full stops',
    ],
    assessmentFocus: 'Procedural writing piece (SBA); oral instructions assessment',
    capsReference: 'CAPS English HL FP p.31–34; ATP Term 3 Week 2',
  },
  {
    week: 3,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Language Structure & Use',
    topic: 'Information Report Reading & Nouns (common, proper, collective)',
    learningOutcomes: [
      'Read a short information report and identify the topic, facts and structure',
      'Distinguish between fiction (story) and non-fiction (information) texts',
      'Identify and classify nouns: common, proper and collective nouns',
      'Use capital letters for proper nouns (names of people, places, days, months)',
      'Use phonics to decode words with digraphs (sh, ch, th, wh, ph)',
    ],
    activities: [
      'Non-fiction reading — read an information text about South African animals',
      'Fiction vs non-fiction sort — classify texts into story or information categories',
      'Noun hunt — find and sort nouns in a passage (common, proper, collective)',
      'Digraph dominoes — match words that share the same digraph',
    ],
    assessmentFocus: 'Reading comprehension: information text; noun classification exercise',
    capsReference: 'CAPS English HL FP p.35–38; ATP Term 3 Week 3',
  },
  {
    week: 4,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Listening & Speaking',
    topic: 'Information Report Writing & Oral Presentation',
    learningOutcomes: [
      'Write a short information report (6–8 sentences) with an opening statement, facts, and closing',
      'Use present tense for factual writing (lives, eats, has, is)',
      'Include at least 3 facts about the topic',
      'Present a 1-minute oral report about a chosen topic to the class',
      'Use visual aids (drawing or object) to support an oral presentation',
    ],
    activities: [
      'Research mini-project — choose an animal or place and write 3 facts',
      'Report writing — draft, edit and publish an information report',
      'Present tense practice — convert past tense sentences to present tense',
      'Show and Tell — present oral report with a visual aid',
    ],
    assessmentFocus: 'Information report writing (SBA); oral presentation rubric',
    capsReference: 'CAPS English HL FP p.39–42; ATP Term 3 Week 4',
  },
  {
    week: 5,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Language Structure & Use',
    topic: 'Reading Comprehension — Stories, Adjectives & Adverbs',
    learningOutcomes: [
      'Read a story independently and answer literal and inferential questions',
      'Identify adjectives (describing words) and their role in sentences',
      'Identify adverbs of manner (how): slowly, quickly, carefully, loudly',
      'Use adjectives and adverbs to make writing more descriptive',
      'Use phonics: silent letters (kn, wr, mb), r-controlled vowels (ar, er, ir, or, ur)',
    ],
    activities: [
      'Comprehension passage — read a story and answer 5 questions in full sentences',
      'Adjective expansion — add describing words to plain sentences',
      'Adverb actions — act out verbs with adverbs (walk slowly, jump high, whisper quietly)',
      'Silent letter sort — identify silent letters in words: knee, write, lamb, knight',
    ],
    assessmentFocus: 'Reading comprehension test; adjective and adverb worksheet',
    capsReference: 'CAPS English HL FP p.43–46; ATP Term 3 Week 5',
  },
  {
    week: 6,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Language Structure & Use',
    topic: 'Descriptive & Imaginative Writing, Conjunctions',
    learningOutcomes: [
      'Write a descriptive paragraph using adjectives and sensory detail (5 senses)',
      'Use conjunctions to join sentences: and, but, because, so, or',
      'Extend sentences to add more information and interest',
      'Use commas in a list of items (I bought apples, bread, milk and eggs)',
      'Spell words with common suffixes: -ful, -less, -ly, -ness, -er, -est',
    ],
    activities: [
      'Describe a place — write about a favourite place using senses (I can see…, I can hear…)',
      'Conjunction join-up — combine short sentences using and, but, because',
      'Comma practice — write lists using commas correctly',
      'Suffix word building — add suffixes to root words and use in sentences',
    ],
    assessmentFocus: 'Descriptive writing piece; conjunction and suffix exercises',
    capsReference: 'CAPS English HL FP p.47–50; ATP Term 3 Week 6',
  },
  {
    week: 7,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Listening & Speaking',
    topic: 'Book Review, Personal Opinion & Discussion',
    learningOutcomes: [
      'Read a book and write a simple book review (title, author, summary, opinion)',
      'Give a personal opinion using "I think…because…"',
      'Listen to others\' opinions and respond politely, even if you disagree',
      'Identify the beginning, middle and end of a story',
      'Use phonics: vowel digraphs and diphthongs (oo, ou, ow, oi, oy, aw, au)',
    ],
    activities: [
      'Book review template — complete a review for a book you have read',
      'Thumbs up/down — rate a story and explain why (oral discussion)',
      'Story structure — identify beginning, middle and end in a partner\'s story',
      'Phonics vowel sort — categorise words by their vowel sound (oo, ou, ow)',
    ],
    assessmentFocus: 'Written book review; oral opinion sharing',
    capsReference: 'CAPS English HL FP p.51–53; ATP Term 3 Week 7',
  },
  {
    week: 8,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Language Structure & Use',
    topic: 'Narrative Writing (longer story), Direct Speech & Punctuation',
    learningOutcomes: [
      'Write a narrative story (8–10 sentences) with characters, setting, problem and resolution',
      'Use direct speech with inverted commas (speech marks) in writing',
      'Use a variety of punctuation: full stops, question marks, exclamation marks, commas, speech marks',
      'Use dialogue to reveal character in a story',
      'Self-edit using a checklist (punctuation, spelling, capitals, meaning)',
    ],
    activities: [
      'Story planning — plan a narrative using a story mountain (introduction, build-up, problem, resolution, ending)',
      'Speech marks practice — add inverted commas to given sentences',
      'Draft, edit, publish — write, self-check and create a neat final copy',
      'Author\'s chair — read final story aloud and receive peer feedback',
    ],
    assessmentFocus: 'Narrative writing piece (SBA formal writing task — Term 3)',
    capsReference: 'CAPS English HL FP p.54–57; ATP Term 3 Week 8',
  },
  {
    week: 9,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Language Structure & Use',
    topic: 'Reading Comprehension (extended), Dictionary Skills & Word Families',
    learningOutcomes: [
      'Read a longer passage independently (120–180 words) and answer questions',
      'Answer inferential questions: Why do you think…? How do you know?',
      'Use alphabetical order to find words in a simple dictionary',
      'Identify word families: play, played, playing, player, playful',
      'Use prefixes (un-, re-, dis-, pre-) to change word meanings',
    ],
    activities: [
      'Comprehension — read passage and answer 6 questions (literal and inferential)',
      'Dictionary race — look up 5 words and write their meanings',
      'Word family trees — build branches of related words from a root word',
      'Prefix puzzles — add prefixes to words and explain the new meaning',
    ],
    assessmentFocus: 'Reading comprehension test (formal); vocabulary exercise',
    capsReference: 'CAPS English HL FP p.58–60; ATP Term 3 Week 9',
  },
  {
    week: 10,
    subject: 'English Home Language',
    capsContentArea: 'Consolidation & Assessment',
    topic: 'Term 3 Revision & Formal Assessment',
    learningOutcomes: [
      'Consolidate all Term 3 skills: procedural writing, information reports, narratives, grammar',
      'Complete Term 3 formal assessment (reading comprehension + language + writing)',
      'Reflect on progress as a reader and writer',
      'Set targets for Term 4 improvement',
    ],
    activities: [
      'Revision carousel — rotate through reading, grammar, spelling and writing stations',
      'Formal assessment preparation — practice papers covering term 3 content',
      'Spelling revision — study and test Grade 3 word list (Term 3 words)',
      'Goal setting — write 2 language goals for Term 4',
    ],
    assessmentFocus: 'Term 3 Formal Assessment (reading comprehension + language paper)',
    capsReference: 'CAPS English HL FP p.61; ATP Term 3 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// AFRIKAANS FIRST ADDITIONAL LANGUAGE (FAL) — Grade 3 Term 3
// CAPS Content Areas: Listening & Speaking; Reading & Phonics; Writing;
// Language Structure & Use
// ─────────────────────────────────────────────────────────────────────────────

export const AFRIKAANS_FAL_TERM3: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat (Listening & Speaking)',
    topic: 'Tema: My Skool (My School) — Luister en antwoord',
    learningOutcomes: [
      'Listen to a short story about school life in Afrikaans and identify key events',
      'Respond to questions: Wie? Wat? Waar? Wanneer? (Who? What? Where? When?)',
      'Use classroom vocabulary: boek, pen, potlood, tas, lessenaar, bord, juffrou, meneer',
      'Give simple instructions in Afrikaans: Sit, Staan, Lees, Skryf, Luister',
      'Sing a short Afrikaans school song',
    ],
    activities: [
      'Luisterverhaal — listen to a story about a day at school and answer oral questions',
      'Woordkaarte — flashcard drill with school vocabulary and pictures',
      'Klasinstruksies — practise giving and following instructions in Afrikaans',
      'Liedjie — learn and sing "My Skool" with actions',
    ],
    assessmentFocus: 'Oral: respond to questions about a listened text',
    capsReference: 'CAPS Afrikaans FAL FP p.18–20; ATP Term 3 Week 1',
  },
  {
    week: 2,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke (Reading & Phonics)',
    topic: 'Tema: Sport en Speel (Sport & Play) — Lees eenvoudige sinne',
    learningOutcomes: [
      'Read simple Afrikaans sentences about sport and games with picture support',
      'Recognise high-frequency sight words: ek, jy, hy, sy, ons, hulle, van, met',
      'Apply phonics: CVC and CVCC words with short vowels (bal, ren, spring, gooi)',
      'Match pictures to Afrikaans sports vocabulary and sentences',
      'Learn sport vocabulary: bal, sokker, krieket, netbal, hardloop, spring, gooi, vang',
    ],
    activities: [
      'Leeskaarte — read sentence strips about sports with picture support',
      'Klankbou — build sports words using letter tiles (bal, ren, spring)',
      'Prent-en-sin — match sport pictures to sentences: "Ek speel sokker"',
      'Sigwoordspel — sight word matching game with new high-frequency words',
    ],
    assessmentFocus: 'Reading assessment: read 5 simple sentences about sport aloud',
    capsReference: 'CAPS Afrikaans FAL FP p.21–23; ATP Term 3 Week 2',
  },
  {
    week: 3,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Skryf (Writing) / Taalstruktuur (Language Structure)',
    topic: 'Tema: My Huis (My House) — Sinne skryf & Posisiewoorde',
    learningOutcomes: [
      'Write simple sentences about rooms and furniture in the house',
      'Use position words (prepositions): op, in, onder, langs, agter, voor, bo, by',
      'Learn house vocabulary: huis, kamer, kombuis, sitkamer, slaapkamer, badkamer, tuin',
      'Furniture vocabulary: tafel, stoel, bed, kas, bank, TV, yskas, stoof',
      'Copy and complete sentences using position words',
    ],
    activities: [
      'Sinne voltooi — complete sentences: "Die kat is ___ die tafel" (op/onder/langs)',
      'Huis-plakkaat — draw and label rooms in a house in Afrikaans',
      'Posisie-speletjie — place objects and describe where they are in Afrikaans',
      'Skryfoefening — write 5 sentences describing where things are in a picture',
    ],
    assessmentFocus: 'Writing: complete 5 sentences using position words',
    capsReference: 'CAPS Afrikaans FAL FP p.24–26; ATP Term 3 Week 3',
  },
  {
    week: 4,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat / Lees & Klanke',
    topic: 'Tema: Gesondheid (Health) — Luister, praat en lees',
    learningOutcomes: [
      'Listen to a passage about staying healthy and answer oral questions',
      'Name body actions for health: was, borsel, oefen, eet, slaap, drink',
      'Read sentences about healthy habits with comprehension',
      'Use "Ek moet…" (I must…) and "Ek moenie…" (I must not…) in sentences',
      'Phonics: double vowels in Afrikaans (aa, ee, oo, uu) and their sounds',
    ],
    activities: [
      'Luisterbegrip — listen to "Gesonde Gewoontes" and answer Wie? Wat? questions',
      'Gesondheid-plakkaat — create a healthy habits poster with Afrikaans labels',
      'Lees-en-sorteer — sort sentences into healthy (gesond) and unhealthy (ongesond)',
      'Klank-oefening — identify and read words with double vowels (baan, been, boom)',
    ],
    assessmentFocus: 'Listening comprehension; reading: sort healthy/unhealthy sentences',
    capsReference: 'CAPS Afrikaans FAL FP p.27–29; ATP Term 3 Week 4',
  },
  {
    week: 5,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke / Taalstruktuur',
    topic: 'Tema: Inkopies (Shopping) — Woordeskat en getalle',
    learningOutcomes: [
      'Read a simple shopping dialogue in Afrikaans with comprehension',
      'Use shopping phrases: "Hoeveel kos dit?" (How much does it cost?), "Ek wil…hê" (I want…)',
      'Learn numbers 1–20 in Afrikaans: een, twee, drie…twintig',
      'Shopping vocabulary: winkel, geld, rand, sent, koop, betaal, prys, goedkoop, duur',
      'Phonics: consonant combinations specific to Afrikaans (sk, wr, kn)',
    ],
    activities: [
      'Winkel-rolspel — role-play buying and selling in Afrikaans',
      'Nommer-liedjie — sing and learn Afrikaans numbers 1–20',
      'Leesbegrip — read a shopping dialogue and answer questions',
      'Prys-speletjie — match items to prices and practise asking "Hoeveel kos dit?"',
    ],
    assessmentFocus: 'Oral: role-play shopping dialogue; reading comprehension',
    capsReference: 'CAPS Afrikaans FAL FP p.30–32; ATP Term 3 Week 5',
  },
  {
    week: 6,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat / Skryf',
    topic: 'Tema: Dinge wat ek doen (Things I do) — Werkwoorde',
    learningOutcomes: [
      'Use action verbs in Afrikaans: loop, hardloop, spring, sit, staan, skryf, lees, teken, sing',
      'Form simple present tense sentences: "Ek loop skool toe" (I walk to school)',
      'Write 3–5 sentences describing daily activities',
      'Listen to a description of someone\'s day and answer questions',
      'Identify verbs in Afrikaans sentences',
    ],
    activities: [
      'Werkwoord-aksies — act out verbs and have classmates name them in Afrikaans',
      'Dagboek — write 5 sentences about your daily routine in Afrikaans',
      'Luister-en-teken — listen to a daily routine description and draw the activities',
      'Werkwoord-soektog — find and underline all verbs in a given passage',
    ],
    assessmentFocus: 'Writing: 5 sentences about daily routine; verb identification',
    capsReference: 'CAPS Afrikaans FAL FP p.33–35; ATP Term 3 Week 6',
  },
  {
    week: 7,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke / Taalstruktuur',
    topic: 'Tema: Die Natuur (Nature) — Lees met begrip',
    learningOutcomes: [
      'Read a short Afrikaans passage about nature/seasons with comprehension',
      'Nature vocabulary: boom, blom, gras, son, reën, wind, wolk, rivier, berg, see',
      'Seasons: lente, somer, herfs, winter and their characteristics',
      'Answer written questions about the passage (Wie? Wat? Waarom?)',
      'Phonics: Afrikaans diphthongs and combined sounds (ou, ei, ui, oei)',
    ],
    activities: [
      'Leesbegrip — read a passage about seasons in South Africa, answer 5 questions',
      'Seisoene-plakkaat — draw and label the four seasons in Afrikaans',
      'Natuur-woordeskat — word wall activity with nature vocabulary and pictures',
      'Klank-sorteer — sort words by diphthong sounds (ou/ei/ui)',
    ],
    assessmentFocus: 'Reading comprehension: passage with written questions',
    capsReference: 'CAPS Afrikaans FAL FP p.36–38; ATP Term 3 Week 7',
  },
  {
    week: 8,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Skryf / Luister & Praat',
    topic: 'Tema: Vriende (Friends) — Skryf en vertel',
    learningOutcomes: [
      'Write a short recount about an outing with friends (5–7 sentences)',
      'Use past tense markers: het + ge- (het gespeel, het geloop, het gelag)',
      'Friendship vocabulary: vriend, vriendin, saam, speel, lag, deel, help, lief',
      'Describe a friend orally: what they look like and what you do together',
      'Use "want" (because) to give reasons in sentences',
    ],
    activities: [
      'Vriendskapskryfstuk — write about a fun day with your friend',
      'Verlede-tyd oefening — convert present tense to past tense (het ge-)',
      'Mondelinge — describe your best friend to the class in Afrikaans',
      'Vriendskapkaart — design a friendship card with a message in Afrikaans',
    ],
    assessmentFocus: 'Writing: recount about friends; past tense exercise',
    capsReference: 'CAPS Afrikaans FAL FP p.39–41; ATP Term 3 Week 8',
  },
  {
    week: 9,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Consolidation / All skills',
    topic: 'Hersiening (Revision) — All Term 3 themes and structures',
    learningOutcomes: [
      'Revise all Term 3 vocabulary: school, sport, house, health, shopping, actions, nature, friends',
      'Read and respond to mixed comprehension passages',
      'Write 5–7 sentences on a topic of choice using learned structures',
      'Demonstrate listening comprehension through response activities',
      'Consolidate sight words and phonics knowledge',
    ],
    activities: [
      'Woordeskat-toets — vocabulary revision quiz across all Term 3 themes',
      'Lees-hersiening — read 2 short passages and answer mixed questions',
      'Vrye skryf — free writing on topic of choice (with word wall support)',
      'Klank-hersiening — phonics consolidation board game',
    ],
    assessmentFocus: 'Revision test: vocabulary, reading comprehension, sentence writing',
    capsReference: 'CAPS Afrikaans FAL FP p.42; ATP Term 3 Week 9',
  },
  {
    week: 10,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Formal Assessment',
    topic: 'Term 3 Assessering (Term 3 Assessment)',
    learningOutcomes: [
      'Complete formal Term 3 assessment: listening, reading, writing components',
      'Demonstrate growth in Afrikaans vocabulary and sentence construction',
      'Read aloud with improved pronunciation and fluency',
      'Reflect on Afrikaans learning progress in Term 3',
    ],
    activities: [
      'Formele toets — Term 3 written assessment (reading + writing + language)',
      'Lees hardop — individual oral reading assessment',
      'Selfrefleksie — draw/write about what you learned in Afrikaans this term',
      'Woordeskat-viering — celebrate new vocabulary learned (word wall review)',
    ],
    assessmentFocus: 'Term 3 Formal Assessment (SBA — listening, reading, writing)',
    capsReference: 'CAPS Afrikaans FAL FP p.43; ATP Term 3 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// LIFE SKILLS — Grade 3 Term 3
// CAPS Content Areas:
//   - Creative Arts (Visual Arts & Performing Arts)
//   - Physical Education (PE)
// Term 3 Focus: Creative Arts — Visual Arts, Performing Arts (drama, music,
// movement) and Physical Education
// ─────────────────────────────────────────────────────────────────────────────

export const LIFE_SKILLS_TERM3: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Visual Arts',
    topic: 'Visual Arts: Colour Theory — Primary & Secondary Colours',
    learningOutcomes: [
      'Identify and name primary colours (red, blue, yellow)',
      'Mix primary colours to create secondary colours (orange, green, purple)',
      'Create artwork using primary and secondary colours',
      'Explore warm colours (red, orange, yellow) and cool colours (blue, green, purple)',
      'Use colour to express mood and feelings in artwork',
    ],
    activities: [
      'Colour mixing experiment — mix paints to discover secondary colours',
      'Colour wheel — create a colour wheel showing primary and secondary colours',
      'Warm/cool landscape — paint a landscape using only warm or only cool colours',
      'Feelings and colour — paint how different music makes you feel using colour',
    ],
    assessmentFocus: 'Practical: colour mixing experiment and artwork',
    capsReference: 'CAPS Life Skills FP p.35–37; ATP Term 3 Week 1 (Creative Arts)',
  },
  {
    week: 2,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Visual Arts',
    topic: 'Visual Arts: Pattern, Texture & Line in Art',
    learningOutcomes: [
      'Identify and create different types of lines: straight, curved, zigzag, wavy, spiral',
      'Find patterns in nature and in human-made objects',
      'Create textured art using different materials and techniques (rubbings, collage)',
      'Design a repeating pattern using at least 3 elements',
      'Use art vocabulary: line, pattern, texture, rough, smooth, bumpy, repeat',
    ],
    activities: [
      'Line exploration — draw different line types and create a line design',
      'Texture rubbings — collect rubbings of surfaces around the school (bark, brick, leaf)',
      'Pattern design — create a repeating border pattern for a frame',
      'Nature collage — create a textured artwork using natural materials (leaves, seeds, grass)',
    ],
    assessmentFocus: 'Creative portfolio: pattern design and texture artwork',
    capsReference: 'CAPS Life Skills FP p.38–40; ATP Term 3 Week 2 (Creative Arts)',
  },
  {
    week: 3,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Visual Arts',
    topic: 'Visual Arts: Drawing from Observation & Imagination',
    learningOutcomes: [
      'Draw from observation: look carefully and draw what you see (still life)',
      'Use pencil control techniques: shading, hatching, light and dark',
      'Develop fine motor control through detailed drawing',
      'Draw from imagination: illustrate a story or dream',
      'Compare observational and imaginative drawings and discuss differences',
    ],
    activities: [
      'Still life drawing — arrange objects and draw from observation (fruit, flowers, toys)',
      'Shading practice — shade circles from light to dark using pencil pressure',
      'Story illustration — draw a scene from a favourite story or own imagination',
      'Art comparison — discuss: "How is drawing what you see different from drawing what you imagine?"',
    ],
    assessmentFocus: 'Observational drawing assessment; pencil control',
    capsReference: 'CAPS Life Skills FP p.41–43; ATP Term 3 Week 3 (Creative Arts)',
  },
  {
    week: 4,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Performing Arts / Physical Education',
    topic: 'Performing Arts: Creative Movement & Dance',
    learningOutcomes: [
      'Express feelings and ideas through creative body movement',
      'Move in response to different types of music (fast, slow, loud, soft)',
      'Learn and perform a simple dance sequence (8–16 counts)',
      'Demonstrate spatial awareness: levels (high, middle, low), directions, pathways',
      'Work cooperatively in a group to create a short movement piece',
    ],
    activities: [
      'Music and movement — move freely to different genres of music',
      'Dance sequence — learn a simple 8-count dance routine step by step',
      'Levels exploration — move at high, middle and low levels to music',
      'Group dance — create a 16-count group routine and perform for peers',
    ],
    assessmentFocus: 'Practical: dance performance (group and individual)',
    capsReference: 'CAPS Life Skills FP p.44–46; ATP Term 3 Week 4 (Creative Arts/PE)',
  },
  {
    week: 5,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Performing Arts',
    topic: 'Performing Arts: Drama & Storytelling through Role-Play',
    learningOutcomes: [
      'Use voice (loud, soft, fast, slow) and body language to express character',
      'Act out a familiar story through role-play in a small group',
      'Create a short improvised scene based on a given situation',
      'Use facial expressions to convey different emotions',
      'Listen to and watch performances and give simple feedback',
    ],
    activities: [
      'Emotion charades — act out feelings using facial expressions and body language',
      'Story drama — act out a South African folktale in small groups',
      'Improvisation — create a scene from a given scenario (e.g. "lost at the shops")',
      'Performance feedback — watch a group perform and say one positive thing',
    ],
    assessmentFocus: 'Drama assessment: participation in role-play and expression',
    capsReference: 'CAPS Life Skills FP p.47–49; ATP Term 3 Week 5 (Creative Arts)',
  },
  {
    week: 6,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Performing Arts',
    topic: 'Music: Rhythm, Beat & Body Percussion',
    learningOutcomes: [
      'Keep a steady beat using clapping, tapping and stamping',
      'Identify and clap simple rhythm patterns (long and short sounds)',
      'Create body percussion sequences using different body sounds (clap, tap, stomp, click)',
      'Perform a rhythm pattern in a group, keeping time together',
      'Identify loud (forte) and soft (piano) in music',
    ],
    activities: [
      'Steady beat circle — keep the beat to a song using different body parts',
      'Rhythm echo — teacher claps a pattern, learners echo it back',
      'Body percussion composition — create a 4-bar body percussion piece in pairs',
      'Loud and soft — listen to music and identify loud and soft sections',
    ],
    assessmentFocus: 'Practical: rhythm and body percussion performance',
    capsReference: 'CAPS Life Skills FP p.50–52; ATP Term 3 Week 6 (Creative Arts)',
  },
  {
    week: 7,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Performing Arts',
    topic: 'Music: Singing, Melody & South African Songs',
    learningOutcomes: [
      'Sing in tune with a group, maintaining pitch and rhythm',
      'Explore high and low pitch using voice and simple instruments',
      'Learn and sing South African songs in at least two languages',
      'Identify and describe the difference between singing and speaking voice',
      'Express meaning through singing with appropriate dynamics and expression',
    ],
    activities: [
      'Pitch exploration — use hand signs to show high, middle and low sounds',
      'Song learning — learn "Thula Baba" (isiZulu lullaby) and an Afrikaans song',
      'Singing vs speaking — compare singing and speaking the same words',
      'Class concert rehearsal — practise songs with expression for week 10 showcase',
    ],
    assessmentFocus: 'Singing assessment: pitch accuracy and expression in group singing',
    capsReference: 'CAPS Life Skills FP p.53–55; ATP Term 3 Week 7 (Creative Arts)',
  },
  {
    week: 8,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Visual Arts',
    topic: 'Craft & Design: 3-D Construction with Recycled Materials',
    learningOutcomes: [
      'Use recycled materials (boxes, bottles, lids, fabric) to design and build a 3-D model',
      'Follow a simple design process: plan, make, evaluate',
      'Join materials using appropriate techniques (glue, tape, string, staples)',
      'Decorate finished product using paint, paper or fabric',
      'Present and explain the design to the class',
    ],
    activities: [
      'Design brief — plan what to build (draw a labelled design)',
      'Build session — construct the model using recycled materials',
      'Decorate — paint and embellish the finished construction',
      'Show and tell — present the finished model and explain the design choices',
    ],
    assessmentFocus: 'Design and technology project: plan, make, evaluate',
    capsReference: 'CAPS Life Skills FP p.56–58; ATP Term 3 Week 8 (Creative Arts)',
  },
  {
    week: 9,
    subject: 'Life Skills',
    capsContentArea: 'Physical Education',
    topic: 'Physical Education: Team Games, Ball Skills & Coordination',
    learningOutcomes: [
      'Participate in team games following rules and demonstrating fair play',
      'Practise throwing, catching and bouncing a ball with accuracy',
      'Demonstrate eye-hand coordination through target activities',
      'Cooperate with team members and encourage others',
      'Understand the importance of warming up and cooling down',
    ],
    activities: [
      'Warm-up routine — jog, stretch and mobilise before activity',
      'Ball skills circuit — stations for throwing, catching, bouncing, dribbling',
      'Target challenge — throw beanbags at targets from increasing distances',
      'Team relay — cooperative relay race with ball-passing component',
    ],
    assessmentFocus: 'Practical: ball skills and coordination assessment',
    capsReference: 'CAPS Life Skills FP p.59–61; ATP Term 3 Week 9 (PE)',
  },
  {
    week: 10,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Consolidation & Showcase',
    topic: 'Arts Showcase: Performance, Display & Celebration',
    learningOutcomes: [
      'Present creative work (visual art, drama, music, dance) to an audience',
      'Reflect on growth and achievements in Creative Arts during Term 3',
      'Appreciate and celebrate the creative work of peers',
      'Evaluate own work: What went well? What would I change?',
      'Participate in a combined performance event (song, dance, drama)',
    ],
    activities: [
      'Art exhibition — display visual artwork for parents/other classes to view',
      'Class concert — perform songs, dances and drama pieces',
      'Peer feedback — give one positive comment about a classmate\'s work',
      'Reflection journal — write/draw about favourite creative arts moment this term',
    ],
    assessmentFocus: 'Term 3 Practical Assessment: Creative Arts (portfolio + performance)',
    capsReference: 'CAPS Life Skills FP p.62; ATP Term 3 Week 10 (Creative Arts)',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CODING & ROBOTICS — Grade 3 Term 3 (Draft CAPS Pilot Curriculum)
// Strands: Algorithms & Coding; Robotics; Internet & e-Communication;
// Application Skills
// Term 3 Focus: Sequences & Algorithms, Pattern recognition, Loops (repeat),
// Simple robotics concepts, Basic application skills
// ─────────────────────────────────────────────────────────────────────────────

export const CODING_ROBOTICS_TERM3: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'What is an Algorithm? — Everyday Instructions',
    learningOutcomes: [
      'Define an algorithm as a set of step-by-step instructions',
      'Identify algorithms in everyday life (recipes, directions, getting dressed)',
      'Write a simple algorithm for a daily task (5–7 steps)',
      'Understand that the order of steps matters (sequence)',
      'Follow a written algorithm precisely to complete a task',
    ],
    activities: [
      'Morning routine algorithm — write step-by-step instructions for getting ready for school',
      'Sandwich algorithm — write precise instructions for making a sandwich (test with a partner who follows literally)',
      'Order matters — rearrange jumbled instruction cards into correct sequence',
      'Partner test — swap algorithms and follow them exactly (find unclear steps)',
    ],
    assessmentFocus: 'Write a clear 5-step algorithm; identify sequence errors',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 1',
  },
  {
    week: 2,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Sequences & Debugging — Finding and Fixing Errors',
    learningOutcomes: [
      'Write sequences of instructions using directional commands (forward, backward, left, right)',
      'Follow a sequence to navigate a grid or maze',
      'Identify an error (bug) in a sequence of instructions',
      'Fix (debug) the error to make the algorithm work correctly',
      'Understand that debugging is a normal and important part of coding',
    ],
    activities: [
      'Grid navigation — program a partner to walk through a floor grid using commands',
      'Maze challenge — write a sequence to navigate a paper maze',
      'Bug hunt — find the error in a given set of instructions and circle it',
      'Fix it! — rewrite the corrected algorithm after finding the bug',
    ],
    assessmentFocus: 'Debug 3 algorithms; write a correct sequence for a grid maze',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 2',
  },
  {
    week: 3,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Pattern Recognition & Decomposition',
    learningOutcomes: [
      'Identify repeating patterns in sequences of shapes, colours, or actions',
      'Describe the rule of a pattern (what repeats, what changes)',
      'Understand decomposition: breaking a big problem into smaller parts',
      'Decompose a complex task into 3–4 smaller sub-tasks',
      'Recognise that patterns in problems help us solve them more efficiently',
    ],
    activities: [
      'Pattern detective — identify the repeating unit in visual and number patterns',
      'Decompose a party — break "plan a birthday party" into smaller tasks',
      'Pattern completion — complete missing elements in a pattern sequence',
      'Big task, small steps — choose a complex task and break it into 4 sub-tasks',
    ],
    assessmentFocus: 'Pattern recognition worksheet; decomposition task',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 3',
  },
  {
    week: 4,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Loops — Repeat Instructions',
    learningOutcomes: [
      'Understand that a loop repeats a set of instructions a specific number of times',
      'Identify repeated actions in everyday life (e.g. clap 4 times, jump 3 times)',
      'Rewrite repetitive instructions using "Repeat X times" notation',
      'Use loops to shorten an algorithm',
      'Predict the outcome of a simple loop',
    ],
    activities: [
      'Repeat dance — follow instructions like "Repeat 4 times: step left, clap, step right, clap"',
      'Loop shortcut — rewrite long sequences using repeat notation',
      'Drawing with loops — draw a pattern by repeating the same steps (e.g. square spiral)',
      'Predict and check — "What will happen if we repeat these 3 steps 5 times?"',
    ],
    assessmentFocus: 'Rewrite 3 repetitive algorithms using loops; predict loop outcomes',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 4',
  },
  {
    week: 5,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Combining Sequences & Loops — Drawing Patterns',
    learningOutcomes: [
      'Combine sequences and loops in a single algorithm',
      'Use loops to draw geometric patterns (e.g. repeat 4 times: forward, turn right = square)',
      'Write algorithms for increasingly complex patterns',
      'Test algorithms by acting them out or using a coding tool',
      'Compare algorithms: which uses fewer instructions (efficiency)?',
    ],
    activities: [
      'Shape algorithms — write a loop to draw a square, triangle, hexagon',
      'Pattern art — use repeated loops to create a visual pattern on grid paper',
      'Efficiency challenge — compare a long sequence vs the same task with a loop',
      'Code.org / Scratch Jr — complete a looping puzzle on screen',
    ],
    assessmentFocus: 'Write loop-based algorithms for 2 shapes; explain efficiency',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 5',
  },
  {
    week: 6,
    subject: 'Coding & Robotics',
    capsContentArea: 'Robotics',
    topic: 'What is a Robot? — Inputs, Processes & Outputs',
    learningOutcomes: [
      'Define a robot as a machine that follows instructions and can sense its environment',
      'Identify robots in everyday life: washing machine, traffic light, ATM, self-checkout',
      'Understand the input → process → output cycle',
      'Identify what a robot can sense (input) and what it can do (output)',
      'Distinguish between robots and non-robots with reasons',
    ],
    activities: [
      'Robot or not? — sort pictures of machines into robots and not-robots, give reasons',
      'Input-output matching — match sensors (inputs) to actions (outputs)',
      'Everyday robots — find and draw 3 robots you use at home or in your community',
      'Human robot — one learner gives inputs (commands), partner acts as robot (outputs)',
    ],
    assessmentFocus: 'Classify 5 items as robot/not-robot with reasons; label inputs and outputs',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 6',
  },
  {
    week: 7,
    subject: 'Coding & Robotics',
    capsContentArea: 'Robotics',
    topic: 'Designing a Robot — Planning & Drawing',
    learningOutcomes: [
      'Design a robot on paper for a specific purpose (e.g. a tidying robot, a feeding robot)',
      'Label the robot\'s inputs (sensors) and outputs (actions)',
      'Write a simple algorithm that the robot would follow',
      'Explain the robot\'s purpose and how it solves a problem',
      'Consider what materials would be needed to build the robot',
    ],
    activities: [
      'Design challenge — draw and label a robot that helps with a household chore',
      'Algorithm for my robot — write 5–7 steps the robot would follow',
      'Materials list — decide what you would build your robot from',
      'Design pitch — present your robot design to the class (30-second explanation)',
    ],
    assessmentFocus: 'Robot design drawing with labels; written algorithm for robot',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 7',
  },
  {
    week: 8,
    subject: 'Coding & Robotics',
    capsContentArea: 'Internet & e-Communication',
    topic: 'What is the Internet? — Basic Concepts & Online Communication',
    learningOutcomes: [
      'Explain that the internet connects computers and devices around the world',
      'Identify devices that connect to the internet: phone, tablet, computer, smart TV',
      'Name things we can do online: search, communicate, learn, play, watch',
      'Understand basic online communication: email, messages, video calls',
      'Know that everything shared online can be seen by others (digital footprint basics)',
    ],
    activities: [
      'Connected world — draw a web showing devices connected to the internet',
      'What can we do online? — sort activity cards into online/offline categories',
      'Email parts — label the parts of an email (to, from, subject, body)',
      'Digital footprint discussion — "What happens when you post something online?"',
    ],
    assessmentFocus: 'Label internet-connected devices; explain digital footprint concept',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 8',
  },
  {
    week: 9,
    subject: 'Coding & Robotics',
    capsContentArea: 'Application Skills',
    topic: 'Using Technology Tools — Word Processing & Drawing',
    learningOutcomes: [
      'Open and use a simple word processing application (type, save, print)',
      'Type a short paragraph (5–7 sentences) using basic formatting (bold, font size)',
      'Use a drawing application to create a simple digital picture',
      'Save files with appropriate names in a designated folder',
      'Use basic keyboard skills: spacebar, enter, backspace, shift for capitals',
    ],
    activities: [
      'Typing practice — type your name, school and 3 sentences about yourself',
      'Bold and size — format a title in bold and change font size',
      'Digital drawing — create a picture using shapes and colours in a paint program',
      'Save and find — save work, close the file, then find and open it again',
    ],
    assessmentFocus: 'Practical: type and save a short paragraph; create and save a drawing',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 9',
  },
  {
    week: 10,
    subject: 'Coding & Robotics',
    capsContentArea: 'Consolidation & Assessment',
    topic: 'Term 3 Revision & Assessment',
    learningOutcomes: [
      'Revise key concepts: algorithms, sequences, debugging, patterns, loops, robots, internet',
      'Demonstrate understanding of key vocabulary: algorithm, sequence, loop, debug, pattern, robot, input, output',
      'Complete a practical coding challenge combining sequences and loops',
      'Reflect on learning and set goals for Term 4',
    ],
    activities: [
      'Vocabulary matching — match terms to definitions in a quiz game',
      'Coding challenge — write an algorithm with at least one loop to solve a maze',
      'Robot recall — explain what a robot is and draw one with inputs and outputs labelled',
      'Reflection — "What was the most interesting thing I learned? What do I want to learn in Term 4?"',
    ],
    assessmentFocus: 'Term 3 Assessment: practical algorithm task + vocabulary quiz',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXPORT — Full Term 3 ATP Data
// ─────────────────────────────────────────────────────────────────────────────

export const TERM_3_ATP: Term3ATPData = {
  grade: 3,
  term: 3,
  year: 2026,
  subjects: [
    {
      subject: 'Mathematics',
      grade: 3,
      term: 3,
      totalWeeks: 10,
      weeklyPlan: MATHS_TERM3,
    },
    {
      subject: 'English Home Language',
      grade: 3,
      term: 3,
      totalWeeks: 10,
      weeklyPlan: ENGLISH_HL_TERM3,
    },
    {
      subject: 'Afrikaans FAL',
      grade: 3,
      term: 3,
      totalWeeks: 10,
      weeklyPlan: AFRIKAANS_FAL_TERM3,
    },
    {
      subject: 'Life Skills',
      grade: 3,
      term: 3,
      totalWeeks: 10,
      weeklyPlan: LIFE_SKILLS_TERM3,
    },
    {
      subject: 'Coding & Robotics',
      grade: 3,
      term: 3,
      totalWeeks: 10,
      weeklyPlan: CODING_ROBOTICS_TERM3,
    },
  ],
};

// Helper: get all ATP entries for a specific week across all subjects
export function getTerm3ATPWeek(week: number): ATPWeekEntry[] {
  return TERM_3_ATP.subjects.flatMap(s => s.weeklyPlan.filter(w => w.week === week));
}

// Helper: get all ATP entries for a specific subject
export function getTerm3ATPBySubject(subject: string): ATPWeekEntry[] {
  const plan = TERM_3_ATP.subjects.find(s => s.subject === subject);
  return plan ? plan.weeklyPlan : [];
}

// Helper: get learning outcomes for a specific week and subject
export function getTerm3LearningOutcomes(week: number, subject: string): string[] {
  const entry = TERM_3_ATP.subjects
    .find(s => s.subject === subject)
    ?.weeklyPlan.find(w => w.week === week);
  return entry ? entry.learningOutcomes : [];
}
