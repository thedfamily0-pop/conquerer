/**
 * CAPS-Aligned Annual Teaching Plan (ATP) — Grade 3, Term 4
 * 
 * Sources: DBE CAPS Foundation Phase documents, 2023/24 & 2025/26 ATPs
 * Subjects covered:
 *   - Mathematics
 *   - English Home Language
 *   - Afrikaans First Additional Language
 *   - Life Skills (Personal & Social Well-being, Creative Arts, Physical Education)
 *   - Coding & Robotics (Draft CAPS pilot)
 *
 * Term 4 typically runs 10 weeks (±47 school days).
 * Each week entry includes: CAPS content area, specific topics, learning outcomes,
 * suggested activities, and assessment focus aligned to the ATP.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ATPWeekEntry {
  week: number;
  subject: string;
  capsContentArea: string;
  topic: string;
  learningOutcomes: string[];
  activities: string[];
  assessmentFocus?: string;
  capsReference?: string;
}

export interface ATPSubjectPlan {
  subject: string;
  grade: number;
  term: number;
  totalWeeks: number;
  weeklyPlan: ATPWeekEntry[];
}

export interface Term4ATPData {
  grade: number;
  term: number;
  year: number;
  subjects: ATPSubjectPlan[];
}


// ─────────────────────────────────────────────────────────────────────────────
// MATHEMATICS — Grade 3 Term 4
// CAPS Content Areas: Numbers, Operations & Relationships; Patterns, Functions
// & Algebra; Space & Shape; Measurement; Data Handling
// Number range: 0–999 (consolidation), 0–1000 (extension)
// ─────────────────────────────────────────────────────────────────────────────

export const MATHS_TERM4: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Whole Numbers — Counting, Ordering & Place Value (0–999)',
    learningOutcomes: [
      'Count forwards and backwards in 2s, 3s, 5s, 10s, 25s, 50s, and 100s between 0 and 999',
      'Recognise, identify and read number symbols 0–999',
      'Write number symbols and number names 0–999',
      'Order and compare whole numbers to 999 using <, > and =',
      'Describe and order numbers according to place value (hundreds, tens, ones)',
      'Decompose 3-digit numbers: e.g. 456 = 400 + 50 + 6',
    ],
    activities: [
      'Number line jumps — mark missing numbers on an empty number line (counting in 25s and 50s)',
      'Place value arrow cards — build and break apart 3-digit numbers',
      'Ordering relay — arrange number cards from smallest to greatest',
      'Decomposition station — expand numbers into hundreds, tens and ones using Dienes blocks',
    ],
    assessmentFocus: 'Oral counting assessment; written place value decomposition task',
    capsReference: 'CAPS Mathematics FP p.130–132; ATP Term 4 Week 1',
  },
  {
    week: 2,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Addition & Subtraction (3-digit numbers)',
    learningOutcomes: [
      'Add up to 999 using breaking down, building up and rounding off strategies',
      'Subtract from numbers up to 999 using various strategies',
      'Use number lines to illustrate addition and subtraction',
      'Solve context (word) problems involving addition and subtraction',
      'Check solutions using inverse operations',
    ],
    activities: [
      'Word problem workshop — solve real-life scenarios (shopping, distance, tuck shop)',
      'Strategy wall — learners demonstrate different methods (vertical, breaking down, compensation)',
      'Inverse check — verify subtraction answers using addition',
      'Speed challenge — 10 mental maths sums in 3 minutes',
    ],
    assessmentFocus: 'Written test: addition and subtraction with 3-digit numbers (SBA Term 4 Task)',
    capsReference: 'CAPS Mathematics FP p.134–138; ATP Term 4 Week 2',
  },
  {
    week: 3,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Multiplication & Division (×2, ×3, ×4, ×5, ×10)',
    learningOutcomes: [
      'Multiply whole numbers to at least 10 × 10 (focus: 2×, 3×, 4×, 5×, 10×)',
      'Solve multiplication problems using repeated addition and arrays',
      'Divide numbers up to 99 by 2, 3, 4, 5, and 10 with and without remainders',
      'Use multiplication and division as inverse operations',
      'Solve context problems involving equal sharing and grouping',
    ],
    activities: [
      'Array art — draw arrays for multiplication facts and find related division',
      'Times tables bingo — call out products, learners cover the matching fact',
      'Sharing word problems — divide sweets, crayons, stickers into groups',
      'Fact family triangles — write all 4 related facts for each triangle',
    ],
    assessmentFocus: 'Multiplication and division fact fluency assessment',
    capsReference: 'CAPS Mathematics FP p.139–142; ATP Term 4 Week 3',
  },
  {
    week: 4,
    subject: 'Mathematics',
    capsContentArea: 'Numbers, Operations & Relationships',
    topic: 'Common Fractions',
    learningOutcomes: [
      'Use and name fractions in familiar contexts: halves, quarters, thirds, fifths, sixths, eighths',
      'Recognise fractions as equal parts of a whole',
      'Compare fractions with the same denominator (e.g. 2/4 and 3/4)',
      'Solve problems involving equal sharing leading to fractions',
      'Represent fractions using diagrams (circles, rectangles, number lines)',
    ],
    activities: [
      'Pizza fractions — fold paper circles and shade fractional parts',
      'Fraction wall poster — compare unit fractions visually',
      'Fair sharing — divide objects among groups and write the fraction each gets',
      'Fraction number line — place halves, quarters, thirds on a 0 to 1 number line',
    ],
    assessmentFocus: 'Practical task: identify and represent fractions of wholes and collections',
    capsReference: 'CAPS Mathematics FP p.145–147; ATP Term 4 Week 4',
  },
  {
    week: 5,
    subject: 'Mathematics',
    capsContentArea: 'Measurement',
    topic: 'Capacity & Volume',
    learningOutcomes: [
      'Estimate, measure and compare capacity using litres and millilitres',
      'Know the relationship: 1 litre = 1 000 millilitres',
      'Read measuring jugs marked in litres and millilitres',
      'Solve capacity problems in context (recipes, filling containers)',
      'Order containers from least to greatest capacity',
    ],
    activities: [
      'Water station — measure actual liquids using measuring jugs (hands-on)',
      'Recipe maths — calculate how much liquid is needed if a recipe is doubled',
      'Estimation jars — guess and then measure the capacity of various containers',
      'Capacity comparison chart — record results and order from smallest to largest',
    ],
    assessmentFocus: 'Practical measurement task: capacity (SBA continuous assessment)',
    capsReference: 'CAPS Mathematics FP p.155–157; ATP Term 4 Week 5',
  },
  {
    week: 6,
    subject: 'Mathematics',
    capsContentArea: 'Measurement',
    topic: 'Mass',
    learningOutcomes: [
      'Estimate, measure and compare mass using kilograms and grams',
      'Know the relationship: 1 kilogram = 1 000 grams',
      'Read a bathroom scale and kitchen scale',
      'Solve problems involving mass in context (shopping, baking, posting parcels)',
      'Compare and order objects by mass',
    ],
    activities: [
      'Weigh station — use kitchen scales to weigh classroom objects',
      'Heavier or lighter — predict and verify using a balance scale',
      'Post office roleplay — weigh parcels and calculate postage based on mass',
      'Mass word problems — solve contextual problems involving kg and g',
    ],
    assessmentFocus: 'Practical measurement: mass; written word problems',
    capsReference: 'CAPS Mathematics FP p.157–159; ATP Term 4 Week 6',
  },
  {
    week: 7,
    subject: 'Mathematics',
    capsContentArea: 'Patterns, Functions & Algebra',
    topic: 'Geometric Patterns & Number Patterns',
    learningOutcomes: [
      'Copy, extend and describe simple geometric patterns using physical objects and drawings',
      'Create own geometric patterns',
      'Identify, describe and copy number patterns in sequences (addition/subtraction)',
      'Describe observed patterns in own words',
      'Identify patterns in number charts (100-chart, multiplication tables)',
    ],
    activities: [
      'Bead necklaces — create repeating and growing patterns with beads',
      'Pattern detectives — find hidden rules in number sequences',
      '100-chart colouring — shade multiples and describe patterns observed',
      'Design a tile — create a tessellation pattern using shape cut-outs',
    ],
    assessmentFocus: 'Pattern identification and extension (oral and written)',
    capsReference: 'CAPS Mathematics FP p.149–151; ATP Term 4 Week 7',
  },
  {
    week: 8,
    subject: 'Mathematics',
    capsContentArea: 'Space & Shape',
    topic: '3-D Objects & 2-D Shapes (Consolidation)',
    learningOutcomes: [
      'Recognise and name 3-D objects: ball/sphere, box/rectangular prism, cylinder, cone, pyramid',
      'Describe, sort and compare 3-D objects by faces, edges and vertices',
      'Recognise and name 2-D shapes: circle, triangle, square, rectangle',
      'Describe 2-D shapes by number of sides and corners',
      'Relate 2-D shapes to faces of 3-D objects',
    ],
    activities: [
      'Shape hunt — find and photograph 3-D objects in the environment',
      'Build with boxes — construct structures and identify shapes used',
      'Sorting station — classify shapes by properties (flat faces, curved, number of edges)',
      'Shape riddles — describe a shape for a partner to guess',
    ],
    assessmentFocus: 'Shape recognition and property description task',
    capsReference: 'CAPS Mathematics FP p.152–154; ATP Term 4 Week 8',
  },
  {
    week: 9,
    subject: 'Mathematics',
    capsContentArea: 'Data Handling',
    topic: 'Collecting, Organising & Representing Data',
    learningOutcomes: [
      'Collect data by asking questions (surveys) and counting objects',
      'Sort, organise and record data using tally marks and tables',
      'Draw pictographs and bar graphs (one-to-one correspondence)',
      'Read and interpret data from pictographs and bar graphs',
      'Answer questions about data: most, least, more than, fewer than, total',
    ],
    activities: [
      'Class survey — choose a topic, collect data, organise using tallies',
      'Pictograph poster — represent survey data as a pictograph',
      'Bar graph builder — draw a bar graph from a frequency table',
      'Data questions — write and answer 5 questions about a given graph',
    ],
    assessmentFocus: 'Data handling project: collect, represent, interpret (SBA Task)',
    capsReference: 'CAPS Mathematics FP p.160–163; ATP Term 4 Week 9',
  },
  {
    week: 10,
    subject: 'Mathematics',
    capsContentArea: 'Consolidation & Assessment',
    topic: 'Year-End Revision & Formal Assessment',
    learningOutcomes: [
      'Consolidate all Term 4 content: number work, operations, fractions, measurement, shapes, data',
      'Complete year-end formal assessment (SBA examination)',
      'Identify areas of strength and areas needing further support',
      'Reflect on mathematical growth across the year',
    ],
    activities: [
      'Revision stations — rotate through topic stations for guided practice',
      'Practice test — mock exam under timed conditions',
      'Peer tutoring — explain a concept to a classmate',
      'Maths journal — write about favourite maths discovery this year',
    ],
    assessmentFocus: 'Term 4 Formal Assessment Task (SBA examination — 30% of year mark)',
    capsReference: 'CAPS Mathematics FP p.164; ATP Term 4 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH HOME LANGUAGE — Grade 3 Term 4
// CAPS Content Areas: Listening & Speaking; Reading & Phonics; Writing;
// Language Structure & Use
// ─────────────────────────────────────────────────────────────────────────────

export const ENGLISH_HL_TERM4: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'English Home Language',
    capsContentArea: 'Listening & Speaking / Reading & Phonics',
    topic: 'Oral Recount & Reading Comprehension — Stories about families and communities',
    learningOutcomes: [
      'Listen to a story and answer literal and inferential questions',
      'Recount personal experiences using correct sequence (first, then, next, finally)',
      'Read aloud with increasing fluency and expression',
      'Identify main idea and supporting details in a passage',
      'Use phonics knowledge to decode unfamiliar words (long vowel patterns: ai, ay, ee, ea, oa)',
    ],
    activities: [
      'Story time — listen to a read-aloud about families; answer comprehension questions',
      'Show and Tell — recount a weekend experience using sequencing words',
      'Paired reading — read a graded passage and rate fluency together',
      'Phonics station — sort words by long vowel patterns (ai/ay, ee/ea)',
    ],
    assessmentFocus: 'Oral assessment: recount/retell; reading fluency check',
    capsReference: 'CAPS English HL FP p.28–32; ATP Term 4 Week 1',
  },
  {
    week: 2,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Writing',
    topic: 'Reading Comprehension & Narrative Writing (beginning, middle, end)',
    learningOutcomes: [
      'Read a story independently and answer written comprehension questions',
      'Identify characters, setting, problem and solution in a narrative',
      'Write a simple narrative with a clear beginning, middle and end (5–8 sentences)',
      'Use capital letters, full stops and question marks correctly',
      'Use describing words (adjectives) to make writing interesting',
    ],
    activities: [
      'Comprehension worksheet — read passage, answer questions in full sentences',
      'Story map — plan a narrative using a graphic organiser (who, where, what happened)',
      'Writing workshop — draft, edit and publish a short personal narrative',
      'Adjective hunt — find and underline describing words in a text',
    ],
    assessmentFocus: 'Written comprehension test; narrative writing piece (SBA)',
    capsReference: 'CAPS English HL FP p.33–38; ATP Term 4 Week 2',
  },
  {
    week: 3,
    subject: 'English Home Language',
    capsContentArea: 'Language Structure & Use / Writing',
    topic: 'Verbs (past tense), Pronouns & Diary Writing',
    learningOutcomes: [
      'Identify and use verbs in the past tense (regular: -ed; irregular: went, saw, ate)',
      'Use personal pronouns correctly (I, you, he, she, it, we, they)',
      'Write a diary entry about a real or imagined event (past tense)',
      'Use time connectives: yesterday, last week, after that, later',
      'Proofread and correct basic grammar and punctuation errors',
    ],
    activities: [
      'Verb sort — categorise verbs as present or past tense',
      'Irregular verb matching — pair present with past (go→went, eat→ate)',
      'Diary writing — write 2 diary entries about school events using past tense',
      'Editing station — find and fix 5 errors in a given paragraph',
    ],
    assessmentFocus: 'Language exercise: past tense verbs; diary writing piece',
    capsReference: 'CAPS English HL FP p.39–42; ATP Term 4 Week 3',
  },
  {
    week: 4,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Listening & Speaking',
    topic: 'Information Text (non-fiction), Note-taking & Oral Presentation',
    learningOutcomes: [
      'Read a short information text and distinguish between fact and opinion',
      'Identify text features: headings, subheadings, captions, labels',
      'Take simple notes (keywords and phrases) from a read text',
      'Present a short oral report (30–60 seconds) on a chosen topic',
      'Use phonics to decode multi-syllable words (prefixes: un-, re-, dis-)',
    ],
    activities: [
      'Non-fiction reading — read a short article about South African animals',
      'Text features scavenger hunt — label headings, captions, diagrams',
      'Note-taking practice — jot 5 key facts from a read-aloud passage',
      'Mini presentation — 1-minute oral report to the class on chosen animal',
    ],
    assessmentFocus: 'Oral presentation rubric; note-taking activity',
    capsReference: 'CAPS English HL FP p.43–46; ATP Term 4 Week 4',
  },
  {
    week: 5,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Language Structure & Use',
    topic: 'Descriptive Writing & Prepositions',
    learningOutcomes: [
      'Write a descriptive paragraph using the five senses (see, hear, smell, taste, touch)',
      'Use prepositions of place: on, in, under, behind, between, next to, above',
      'Extend sentences using conjunctions: and, but, because, so',
      'Build a word bank of sensory adjectives',
      'Spell high-frequency words correctly (Grade 3 word list consolidation)',
    ],
    activities: [
      'Sensory bag — feel objects in a bag and write descriptive sentences using senses',
      'Preposition treasure hunt — describe where items are hidden using prepositions',
      'Sentence stretchers — expand short sentences using conjunctions and adjectives',
      'Spelling bee — weekly Grade 3 high-frequency word revision',
    ],
    assessmentFocus: 'Descriptive writing piece; spelling test',
    capsReference: 'CAPS English HL FP p.47–50; ATP Term 4 Week 5',
  },
  {
    week: 6,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Language Structure & Use',
    topic: 'Poetry & Rhyme, Syllables & Compound Words',
    learningOutcomes: [
      'Read and recite a short poem with expression',
      'Identify rhyming words and create rhyming pairs',
      'Clap and count syllables in 2- and 3-syllable words',
      'Identify and build compound words (e.g. sun+flower, rain+coat, bed+room)',
      'Understand and explain figurative language at basic level (similes: as big as…)',
    ],
    activities: [
      'Poetry performance — memorise and perform a poem with actions',
      'Rhyme time — match rhyming word cards in a memory game',
      'Syllable clapping — sort word cards by syllable count',
      'Compound word puzzle — join two word halves to create compound words',
    ],
    assessmentFocus: 'Poem recital (oral); syllable and compound word worksheet',
    capsReference: 'CAPS English HL FP p.51–53; ATP Term 4 Week 6',
  },
  {
    week: 7,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Listening & Speaking',
    topic: 'Letter Writing (informal) & Dialogue',
    learningOutcomes: [
      'Write a friendly letter using correct format (greeting, body, closing, signature)',
      'Use speech marks (inverted commas) in written dialogue',
      'Identify the speaker in a conversation/dialogue',
      'Respond to a letter by writing a reply',
      'Listen to and participate in group discussions about familiar topics',
    ],
    activities: [
      'Pen pal letter — write a letter to a classmate or imaginary friend',
      'Speech bubbles — convert speech bubbles into written dialogue with speech marks',
      'Reply writing — read a letter and write an appropriate reply',
      'Group discussion — discuss "What makes a good friend?" and summarise',
    ],
    assessmentFocus: 'Friendly letter writing (SBA continuous assessment)',
    capsReference: 'CAPS English HL FP p.54–56; ATP Term 4 Week 7',
  },
  {
    week: 8,
    subject: 'English Home Language',
    capsContentArea: 'Reading & Phonics / Language Structure & Use',
    topic: 'Reading Comprehension (extended), Synonyms & Antonyms',
    learningOutcomes: [
      'Read a longer passage independently (150–200 words) with understanding',
      'Answer higher-order questions: Why do you think…? What might happen next?',
      'Identify synonyms (words with similar meaning) and antonyms (opposites)',
      'Use context clues to determine meaning of unfamiliar words',
      'Use a simple dictionary or word wall to check spelling and meaning',
    ],
    activities: [
      'Silent reading and response — read passage and write 5 answers independently',
      'Synonym/antonym card game — match word pairs',
      'Context clue detective — figure out meanings of bold words in sentences',
      'Dictionary race — look up 5 words and write meanings',
    ],
    assessmentFocus: 'Reading comprehension test (formal); vocabulary exercise',
    capsReference: 'CAPS English HL FP p.57–60; ATP Term 4 Week 8',
  },
  {
    week: 9,
    subject: 'English Home Language',
    capsContentArea: 'Writing / Language Structure & Use',
    topic: 'Creative Writing (imaginative story), Punctuation Consolidation',
    learningOutcomes: [
      'Write a creative story (8–10 sentences) with a title, characters, setting and plot',
      'Use a variety of punctuation: full stops, question marks, exclamation marks, commas in lists',
      'Use direct speech correctly in writing',
      'Self-edit writing using a checklist (spelling, punctuation, capitals, sense)',
      'Present writing neatly with correct letter formation',
    ],
    activities: [
      'Story starter cards — choose a prompt and write an imaginative story',
      'Punctuation fix-up — correct a passage missing punctuation',
      'Peer editing — swap stories with a partner and give feedback using checklist',
      'Author chair — read final story aloud to the class',
    ],
    assessmentFocus: 'Creative writing piece (SBA formal writing task — Term 4)',
    capsReference: 'CAPS English HL FP p.61–63; ATP Term 4 Week 9',
  },
  {
    week: 10,
    subject: 'English Home Language',
    capsContentArea: 'Consolidation & Assessment',
    topic: 'Year-End Revision & Formal Assessment',
    learningOutcomes: [
      'Consolidate all language skills: reading, writing, listening, speaking, language use',
      'Complete year-end formal assessment (reading comprehension + language + writing)',
      'Reflect on reading journey and growth as a writer',
      'Set reading goals for Grade 4',
    ],
    activities: [
      'Revision carousel — rotate through reading, grammar, spelling and writing stations',
      'Formal assessment preparation — practice papers',
      'Reading celebration — share favourite book/story read this year',
      'Letter to Grade 4 self — reflect on achievements and goals',
    ],
    assessmentFocus: 'Term 4 Formal Assessment (reading comprehension + language paper)',
    capsReference: 'CAPS English HL FP p.64; ATP Term 4 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// AFRIKAANS FIRST ADDITIONAL LANGUAGE (FAL) — Grade 3 Term 4
// CAPS Content Areas: Listening & Speaking; Reading & Phonics; Writing;
// Language Structure & Use
// ─────────────────────────────────────────────────────────────────────────────

export const AFRIKAANS_FAL_TERM4: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat (Listening & Speaking)',
    topic: 'Tema: My Vakansie (My Holiday) — Luister en antwoord',
    learningOutcomes: [
      'Listen to a short story in Afrikaans and identify key information',
      'Respond to simple questions: Wie? Wat? Waar? (Who? What? Where?)',
      'Greet and introduce self in Afrikaans: Hallo, my naam is…',
      'Learn vocabulary: vakansie, strand, berge, swem, speel, lekker, warm, koud',
      'Sing a short Afrikaans action song',
    ],
    activities: [
      'Luisterverhaal — listen to a short holiday story and answer oral questions',
      'Woordkaarte — flashcard vocabulary drill with pictures',
      'Rolspel — greet a partner and say what you did on holiday',
      'Liedjie — learn and sing "Vakansie Pret" with actions',
    ],
    assessmentFocus: 'Oral: respond to questions about a listened text',
    capsReference: 'CAPS Afrikaans FAL FP p.18–20; ATP Term 4 Week 1',
  },
  {
    week: 2,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke (Reading & Phonics)',
    topic: 'Tema: Diere (Animals) — Lees eenvoudige sinne',
    learningOutcomes: [
      'Read simple Afrikaans sentences with familiar vocabulary',
      'Recognise high-frequency sight words: is, het, kan, die, en, my, ons',
      'Apply phonics: Afrikaans vowel sounds (a, e, i, o, u) in CVC words',
      'Match pictures to Afrikaans words and sentences',
      'Learn animal vocabulary: hond, kat, vis, voël, slang, padda, leeu',
    ],
    activities: [
      'Leeskaarte — read sentence strips with picture support',
      'Klankbou — build CVC Afrikaans words using letter tiles (kat, vis, bed)',
      'Prent-en-sin — match animal pictures to sentences: "Die kat is klein"',
      'Sigwoordspel — sight word bingo game',
    ],
    assessmentFocus: 'Reading assessment: read 5 simple sentences aloud',
    capsReference: 'CAPS Afrikaans FAL FP p.21–24; ATP Term 4 Week 2',
  },
  {
    week: 3,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Skryf (Writing) / Taalstruktuur (Language Structure)',
    topic: 'Tema: Kos (Food) — Skryf eenvoudige sinne',
    learningOutcomes: [
      'Write simple Afrikaans sentences with support (sentence frames)',
      'Use correct word order in Afrikaans: Subject + Verb + Object',
      'Learn food vocabulary: brood, melk, appel, water, vleis, groente, vrugte',
      'Use "Ek hou van…" (I like…) and "Ek hou nie van…" (I don\'t like…)',
      'Copy and complete sentences neatly',
    ],
    activities: [
      'Sinne voltooi — complete sentence frames: "Ek hou van ___"',
      'Kos-collage — cut out food pictures, label in Afrikaans, write 3 sentences',
      'Woordskat-muur — add food words to class word wall',
      'Skryfoefening — copy 5 food sentences with correct spelling',
    ],
    assessmentFocus: 'Writing: complete 5 sentences about food preferences',
    capsReference: 'CAPS Afrikaans FAL FP p.25–27; ATP Term 4 Week 3',
  },
  {
    week: 4,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat / Lees & Klanke',
    topic: 'Tema: Kleure en Vorms (Colours & Shapes)',
    learningOutcomes: [
      'Name colours in Afrikaans: rooi, blou, groen, geel, oranje, pers, swart, wit, pienk',
      'Name basic shapes: sirkel, vierkant, driehoek, reghoek',
      'Follow simple instructions in Afrikaans using colours and shapes',
      'Read short sentences combining colour + shape: "Die sirkel is rooi"',
      'Respond to oral instructions: "Kleur die driehoek blou in"',
    ],
    activities: [
      'Kleur-speletjie — colour-by-instruction activity (teacher gives Afrikaans commands)',
      'Vormsorteer — sort shapes and label them with Afrikaans names',
      'Luisteroefening — listen and draw: "Teken ʼn groot groen sirkel"',
      'Lees-en-kleur — read sentences and colour shapes accordingly',
    ],
    assessmentFocus: 'Listening: follow 5 colour/shape instructions correctly',
    capsReference: 'CAPS Afrikaans FAL FP p.28–30; ATP Term 4 Week 4',
  },
  {
    week: 5,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke / Taalstruktuur',
    topic: 'Tema: Liggaamsdele (Body Parts) & Meervoude (Plurals)',
    learningOutcomes: [
      'Name body parts in Afrikaans: kop, oë, ore, neus, mond, arms, hande, bene, voete',
      'Read sentences about body parts with comprehension',
      'Understand and form simple plurals: hond→honde, kat→katte, boom→bome',
      'Use the plural form correctly in sentences',
      'Phonics: consonant blends (bl, br, dr, gr, kr, pl, pr, tr, vr)',
    ],
    activities: [
      'Liggaam-plakkaat — label a body outline poster in Afrikaans',
      'Meervoud-sorteer — change singular words to plural using rules',
      'Klanke-oefening — read and write words with consonant blends',
      'Simon sê (Simon Says) — follow body part instructions in Afrikaans',
    ],
    assessmentFocus: 'Vocabulary test: body parts; plural formation exercise',
    capsReference: 'CAPS Afrikaans FAL FP p.31–33; ATP Term 4 Week 5',
  },
  {
    week: 6,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Luister & Praat / Skryf',
    topic: 'Tema: Die Weer (The Weather) — Beskrywings',
    learningOutcomes: [
      'Describe the weather in Afrikaans: sonnig, bewolk, reënerig, winderig, koud, warm',
      'Use "Dit is…" (It is…) to describe weather',
      'Write 3–5 sentences about today\'s weather',
      'Listen to a weather report and answer questions',
      'Learn days of the week: Maandag, Dinsdag, Woensdag, Donderdag, Vrydag',
    ],
    activities: [
      'Weer-dagboek — daily weather chart written in Afrikaans for 5 days',
      'Luister-en-teken — listen to weather description and draw matching picture',
      'Sinne skryf — write sentences: "Vandag is dit sonnig en warm"',
      'Dae-liedjie — learn days of the week song in Afrikaans',
    ],
    assessmentFocus: 'Writing: 5 weather sentences; oral: describe today\'s weather',
    capsReference: 'CAPS Afrikaans FAL FP p.34–36; ATP Term 4 Week 6',
  },
  {
    week: 7,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Lees & Klanke / Taalstruktuur',
    topic: 'Tema: Vervoer (Transport) — Lees met begrip',
    learningOutcomes: [
      'Read a short Afrikaans passage about transport with comprehension',
      'Transport vocabulary: motor, bus, trein, fiets, vliegtuig, boot, taxi',
      'Answer written questions about the passage (Wie? Wat? Waarheen?)',
      'Use "Ek ry met ʼn…" (I travel with a…) in sentences',
      'Phonics: long vowels and diphthongs (aa, ee, oo, uu, oe, ie, ou, ei)',
    ],
    activities: [
      'Leesbegrip — read passage about a family trip, answer 5 questions',
      'Voertuig-prent — label transport pictures in Afrikaans',
      'Sinne bou — build sentences about how you get to school',
      'Klank-oefening — sort words by vowel/diphthong sounds',
    ],
    assessmentFocus: 'Reading comprehension: short passage with questions',
    capsReference: 'CAPS Afrikaans FAL FP p.37–39; ATP Term 4 Week 7',
  },
  {
    week: 8,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Skryf / Luister & Praat',
    topic: 'Tema: Feeste (Celebrations) — Kreatiewe skryf',
    learningOutcomes: [
      'Write a short recount about a celebration or party (5–8 sentences)',
      'Use past tense markers: het + ge- (het geëet, het gespeel, het gedans)',
      'Celebration vocabulary: verjaardag, partytjie, koek, presente, familie, vriende',
      'Describe a celebration orally using 3–5 sentences',
      'Use "want" (because) to give reasons',
    ],
    activities: [
      'Party-skryfstuk — write about your birthday or a family celebration',
      'Verlede-tyd oefening — convert present tense sentences to past tense',
      'Mondelinge — describe a celebration to a partner (oral practice)',
      'Kaartjie maak — design a party invitation card in Afrikaans',
    ],
    assessmentFocus: 'Writing: recount of a celebration; past tense exercise',
    capsReference: 'CAPS Afrikaans FAL FP p.40–42; ATP Term 4 Week 8',
  },
  {
    week: 9,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Consolidation / All skills',
    topic: 'Hersiening (Revision) — All themes and language structures',
    learningOutcomes: [
      'Revise all Term 4 vocabulary themes: holiday, animals, food, colours, body, weather, transport, celebrations',
      'Read and respond to mixed comprehension passages',
      'Write 5–8 sentences on a topic of choice using learned structures',
      'Demonstrate listening comprehension through response activities',
      'Consolidate sight words and phonics knowledge',
    ],
    activities: [
      'Woordskat-toets — vocabulary revision quiz across all themes',
      'Lees-hersiening — read 2 short passages and answer mixed questions',
      'Vrye skryf — free writing on topic of choice (with word wall support)',
      'Klank-hersiening — phonics consolidation board game',
    ],
    assessmentFocus: 'Revision test: vocabulary, reading comprehension, sentence writing',
    capsReference: 'CAPS Afrikaans FAL FP p.43; ATP Term 4 Week 9',
  },
  {
    week: 10,
    subject: 'Afrikaans FAL',
    capsContentArea: 'Formal Assessment',
    topic: 'Jaareind Assessering (Year-End Assessment)',
    learningOutcomes: [
      'Complete formal year-end assessment: listening, reading, writing components',
      'Demonstrate growth in Afrikaans vocabulary and sentence construction',
      'Read aloud with improved pronunciation and fluency',
      'Reflect on Afrikaans learning journey',
    ],
    activities: [
      'Formele toets — year-end written assessment (reading + writing + language)',
      'Lees hardop — individual oral reading assessment',
      'Selfrefleksie — draw/write about favourite Afrikaans activity this year',
      'Sertifikaat — receive Afrikaans achievement recognition',
    ],
    assessmentFocus: 'Term 4 Formal Assessment (SBA year-end — listening, reading, writing)',
    capsReference: 'CAPS Afrikaans FAL FP p.44; ATP Term 4 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// LIFE SKILLS — Grade 3 Term 4
// CAPS Content Areas:
//   - Personal & Social Well-being (PSW)
//   - Creative Arts (Visual Arts & Performing Arts)
//   - Physical Education (PE)
// Term 4 Focus: PSW — Rights & Responsibilities, Keeping safe, Healthy living
// ─────────────────────────────────────────────────────────────────────────────

export const LIFE_SKILLS_TERM4: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Relationships — Family, Friends & Community',
    learningOutcomes: [
      'Identify different types of relationships: family, friends, community members',
      'Describe the qualities of a good friend (trust, sharing, kindness, loyalty)',
      'Explain how relationships can change and how to handle these changes',
      'Recognise that people have different family structures',
      'Demonstrate respect for others regardless of differences',
    ],
    activities: [
      'Relationship web — draw a diagram showing important people in your life',
      'Good friend recipe — create a recipe card listing friendship qualities',
      'Family diversity discussion — share different family structures respectfully',
      'Role-play — practise including someone who is left out',
    ],
    assessmentFocus: 'Oral discussion; relationship web drawing',
    capsReference: 'CAPS Life Skills FP p.35–37; ATP Term 4 Week 1 (PSW)',
  },
  {
    week: 2,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Rights & Responsibilities of the Child',
    learningOutcomes: [
      'Name at least 5 children\'s rights (education, safety, food, love, play, healthcare)',
      'Understand that every right comes with a responsibility',
      'Distinguish between a right and a privilege',
      'Explain why rules exist at home and at school',
      'Describe how to report if rights are violated (tell a trusted adult)',
    ],
    activities: [
      'Rights poster — illustrate children\'s rights with drawings and captions',
      'Rights vs Responsibilities matching — pair each right with its responsibility',
      'Class contract — create agreed-upon classroom rules together',
      'Story discussion — read a scenario where rights are not respected and discuss solutions',
    ],
    assessmentFocus: 'Rights and responsibilities matching activity',
    capsReference: 'CAPS Life Skills FP p.38–40; ATP Term 4 Week 2 (PSW)',
  },
  {
    week: 3,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Abuse Prevention & Keeping My Body Safe',
    learningOutcomes: [
      'Identify safe and unsafe touches (good touch, bad touch, confusing touch)',
      'Know the body safety rule: "My body belongs to me"',
      'Name 5 trusted adults to tell if feeling unsafe',
      'Practise saying "No!", getting away, and telling someone',
      'Understand that abuse is never the child\'s fault',
    ],
    activities: [
      'Body boundaries — identify private body parts (swimsuit rule)',
      'Safety hand — trace hand and write 5 trusted adults on fingers',
      'Role-play — practise saying "No!" loudly and getting help',
      'Red/Green light scenarios — identify safe vs unsafe situations',
    ],
    assessmentFocus: 'Practical demonstration: safety strategies; trusted adults identified',
    capsReference: 'CAPS Life Skills FP p.41–43; ATP Term 4 Week 3 (PSW)',
  },
  {
    week: 4,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Road Safety & Safety in the Environment',
    learningOutcomes: [
      'Identify common road signs and explain their meanings',
      'Demonstrate safe pedestrian behaviour: stop, look, listen, cross',
      'Explain dangers of playing near roads, water, railways, and electricity',
      'Identify emergency numbers: 10111 (police), 10177 (ambulance), 112 (cell phone emergency)',
      'Understand the role of traffic officers and safety marshals',
    ],
    activities: [
      'Road sign memory game — match signs to their meanings',
      'Road safety obstacle course — practise safe crossing procedure',
      'Emergency numbers poster — create a poster with key contact numbers',
      'Hazard hunt — identify dangers in pictures of different environments',
    ],
    assessmentFocus: 'Road sign identification; emergency number recall',
    capsReference: 'CAPS Life Skills FP p.44–46; ATP Term 4 Week 4 (PSW)',
  },
  {
    week: 5,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Healthy Eating & Hygiene',
    learningOutcomes: [
      'Classify foods into food groups (grains, protein, dairy, fruits, vegetables, fats)',
      'Plan a balanced lunchbox using all food groups',
      'Explain why hand washing is important (before eating, after toilet, after playing)',
      'Demonstrate correct hand-washing technique (20 seconds with soap)',
      'Identify habits that prevent illness: clean water, fresh food, exercise, sleep',
    ],
    activities: [
      'Food group sorting — classify picture cards into food groups',
      'Healthy lunchbox design — plan and draw a balanced lunchbox',
      'Hand-washing station — practise and time correct technique',
      'Hygiene poster — create a "Stay Healthy" poster with top 5 habits',
    ],
    assessmentFocus: 'Food group sorting activity; lunchbox design',
    capsReference: 'CAPS Life Skills FP p.47–49; ATP Term 4 Week 5 (PSW)',
  },
  {
    week: 6,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Visual Arts',
    topic: 'Visual Arts: Printmaking & Patterns (South African inspired)',
    learningOutcomes: [
      'Create a simple relief print using found objects (leaves, cardboard, string)',
      'Explore pattern in South African art: Ndebele, Zulu beadwork, Khoisan rock art',
      'Mix primary colours to create secondary colours for printing',
      'Describe own artwork using art vocabulary: print, pattern, colour, shape, repeat',
      'Appreciate and respect diverse South African artistic traditions',
    ],
    activities: [
      'Leaf printing — press painted leaves onto paper to create prints',
      'Ndebele pattern design — paint geometric patterns inspired by Ndebele houses',
      'Colour mixing experiment — mix paints to discover secondary colours',
      'Art gallery walk — display and describe artwork to peers',
    ],
    assessmentFocus: 'Creative portfolio: printmaking artwork + artist statement',
    capsReference: 'CAPS Life Skills FP p.50–52; ATP Term 4 Week 6 (Creative Arts)',
  },
  {
    week: 7,
    subject: 'Life Skills',
    capsContentArea: 'Creative Arts — Performing Arts',
    topic: 'Performing Arts: Drama, Music & Movement (Cultural celebration)',
    learningOutcomes: [
      'Perform a short dramatisation based on a South African folk tale',
      'Use facial expressions and body language to convey feelings in drama',
      'Sing a South African song in at least 2 languages',
      'Move rhythmically to music: clapping, stamping, swaying in time',
      'Work cooperatively in a group performance',
    ],
    activities: [
      'Folk tale drama — rehearse and perform a short play based on an African story',
      'Body percussion ensemble — create a group rhythm piece using clapping and stamping',
      'Multilingual song — learn and perform "Shosholoza" or "Nkosi Sikelel\' iAfrika"',
      'Movement improvisation — respond to drumbeat with creative movement',
    ],
    assessmentFocus: 'Group performance assessment (drama + music)',
    capsReference: 'CAPS Life Skills FP p.53–55; ATP Term 4 Week 7 (Creative Arts)',
  },
  {
    week: 8,
    subject: 'Life Skills',
    capsContentArea: 'Physical Education',
    topic: 'Physical Education: Games, Sports Skills & Fitness',
    learningOutcomes: [
      'Demonstrate locomotor movements: run, hop, skip, gallop, slide with control',
      'Throw and catch a ball with increasing accuracy (overarm and underarm)',
      'Participate in cooperative and competitive games following rules',
      'Demonstrate spatial awareness: move safely in shared space',
      'Describe the benefits of regular physical activity for body and mind',
    ],
    activities: [
      'Obstacle course — locomotor movement circuit (hop, skip, jump, balance)',
      'Target throw — practise underarm and overarm throwing at targets',
      'Mini-Olympics — relay races and team games',
      'Cool-down discussion — why does exercise make us feel good?',
    ],
    assessmentFocus: 'Practical assessment: locomotor skills and ball skills',
    capsReference: 'CAPS Life Skills FP p.56–58; ATP Term 4 Week 8 (PE)',
  },
  {
    week: 9,
    subject: 'Life Skills',
    capsContentArea: 'Personal & Social Well-being',
    topic: 'Goal Setting, Growth Mindset & Transition to Grade 4',
    learningOutcomes: [
      'Set 3 personal goals for Grade 4 (learning, behaviour, friendship)',
      'Understand the concept of growth mindset: effort leads to improvement',
      'Identify own strengths and areas to develop',
      'Express feelings about change (moving to Grade 4) and develop coping strategies',
      'Celebrate achievements and growth from the year',
    ],
    activities: [
      'Goal-setting worksheet — write 3 SMART goals for next year',
      'Growth mindset discussion — "I can\'t do it YET" vs "I can\'t do it"',
      'Strengths shield — design a shield showing 4 personal strengths',
      'Time capsule — write a letter to future Grade 4 self',
    ],
    assessmentFocus: 'Goal-setting task; self-reflection activity',
    capsReference: 'CAPS Life Skills FP p.59–60; ATP Term 4 Week 9 (PSW)',
  },
  {
    week: 10,
    subject: 'Life Skills',
    capsContentArea: 'Consolidation & Assessment',
    topic: 'Year-End Celebration, Reflection & Assessment',
    learningOutcomes: [
      'Reflect on personal growth across all Life Skills areas during the year',
      'Participate in a class celebration showcasing creative arts, fitness and PSW learning',
      'Complete year-end Life Skills assessment (drawing/oral/written)',
      'Express gratitude to friends, family and teachers',
    ],
    activities: [
      'Portfolio showcase — present best work from the year',
      'Class awards — recognise strengths in each learner (kindness, creativity, effort)',
      'Thank-you card — write/draw a thank-you message for someone special',
      'Year-end quiz — fun review game covering PSW, safety, healthy living topics',
    ],
    assessmentFocus: 'Term 4 Formal Assessment: Life Skills (practical + written)',
    capsReference: 'CAPS Life Skills FP p.61; ATP Term 4 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CODING & ROBOTICS — Grade 3 Term 4 (Draft CAPS Pilot Curriculum)
// Strands: Algorithms & Coding; Robotics; Internet & e-Communication;
// Application Skills
// Term 4 Focus: Conditions (if-then), Loops with conditions, Simple programs,
// Internet safety
// ─────────────────────────────────────────────────────────────────────────────

export const CODING_ROBOTICS_TERM4: ATPWeekEntry[] = [
  {
    week: 1,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Revision — Sequences, Loops & Pattern Recognition',
    learningOutcomes: [
      'Recall and explain what an algorithm is (step-by-step instructions)',
      'Write a sequence of instructions to solve a simple task',
      'Identify and extend repeating patterns in sequences',
      'Use a simple loop (repeat X times) to shorten a set of instructions',
      'Debug a simple sequence by identifying the incorrect step',
    ],
    activities: [
      'Algorithm relay — write instructions for a partner to follow (e.g. navigate a maze)',
      'Pattern blocks — extend a pattern and describe the rule',
      'Loop challenge — rewrite long instruction sets using loops',
      'Bug hunt — find and fix the error in a broken algorithm',
    ],
    assessmentFocus: 'Practical: write and debug an algorithm for a simple task',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 1',
  },
  {
    week: 2,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Conditions — IF-THEN Decisions',
    learningOutcomes: [
      'Understand that a condition is a question with a yes/no (true/false) answer',
      'Write simple IF-THEN rules for everyday situations',
      'Use IF-THEN-ELSE to handle two possible outcomes',
      'Follow a flowchart with a decision diamond',
      'Create own conditional rules for a robot/character',
    ],
    activities: [
      'Condition cards — sort everyday scenarios into IF-THEN format',
      'Human robot — one learner gives conditional commands, another follows',
      'Flowchart drawing — design a decision flowchart for "Should I wear a jacket?"',
      'Scratch Jr / code.org — program a character with conditional events',
    ],
    assessmentFocus: 'Write 3 IF-THEN-ELSE rules; complete a flowchart',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 2',
  },
  {
    week: 3,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Loops with Conditions & Events',
    learningOutcomes: [
      'Understand "repeat until" loops (loop until a condition becomes true)',
      'Combine loops and conditions in a set of instructions',
      'Understand events: "when green flag clicked", "when key pressed"',
      'Create a simple program that uses an event to start and a loop to repeat',
      'Predict the outcome of a program before running it',
    ],
    activities: [
      'Repeat-until maze — walk a maze: "repeat move forward UNTIL you reach the end"',
      'Event-based actions — clap to start, whistle to stop (unplugged events)',
      'Scratch Jr project — program a character to move on a keypress event with a loop',
      'Predict and test — draw what you think will happen, then run the code',
    ],
    assessmentFocus: 'Create a program using event + loop + condition',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 3',
  },
  {
    week: 4,
    subject: 'Coding & Robotics',
    capsContentArea: 'Robotics',
    topic: 'Inputs, Outputs & Sensors in Robots',
    learningOutcomes: [
      'Identify inputs (sensors) and outputs (actions) in everyday robots',
      'Name common sensors: light sensor, touch sensor, sound sensor, distance sensor',
      'Explain the input-process-output cycle',
      'Design a simple robot on paper that uses a sensor to trigger an action',
      'Connect sensors to conditional logic: IF sensor detects X THEN do Y',
    ],
    activities: [
      'Sensor hunt — identify sensors in household devices (phone, TV remote, automatic door)',
      'Design challenge — draw a "pet-feeding robot" with labelled inputs and outputs',
      'Sensor cards — match sensor type to what it detects',
      'If-sensor-then worksheet — write rules: "IF light sensor detects dark THEN turn on light"',
    ],
    assessmentFocus: 'Robot design with labelled inputs/outputs; sensor-condition rules',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 4',
  },
  {
    week: 5,
    subject: 'Coding & Robotics',
    capsContentArea: 'Robotics',
    topic: 'Building & Programming a Simple Robot (unplugged/plugged)',
    learningOutcomes: [
      'Follow instructions to build a simple robot or mechanism from recyclable materials',
      'Write a program (sequence of commands) for the built robot',
      'Test the program and identify if it works as expected',
      'Modify the program to improve robot behaviour (debugging)',
      'Work cooperatively in a team to build and test',
    ],
    activities: [
      'Build a cardboard robot — design and construct a robot with moving parts',
      'Program the robot — write an instruction card for robot behaviour',
      'Test and debug — try the instructions, fix any issues',
      'Robot show — present robot and explain how it works to the class',
    ],
    assessmentFocus: 'Practical: build, program, and present a simple robot',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 5',
  },
  {
    week: 6,
    subject: 'Coding & Robotics',
    capsContentArea: 'Internet & e-Communication',
    topic: 'Internet Safety & Digital Citizenship',
    learningOutcomes: [
      'Explain what the internet is in simple terms (a network connecting computers)',
      'Identify personal information that should NEVER be shared online (full name, address, school, phone number, photos)',
      'Explain the difference between safe and unsafe online behaviour',
      'Know what to do if something online makes you uncomfortable (close, tell an adult)',
      'Understand that information online can be true or false',
    ],
    activities: [
      'Share or Secret? quiz — decide which information is safe to share online',
      'Digital footprint craft — trace foot on paper, write what you share online',
      'Safety rules poster — design a poster with 5 internet safety rules',
      'True or false game — evaluate whether online claims are likely true or false',
    ],
    assessmentFocus: 'Internet safety quiz; personal information identification task',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 6',
  },
  {
    week: 7,
    subject: 'Coding & Robotics',
    capsContentArea: 'Application Skills',
    topic: 'Using Technology Tools — Drawing & Presentations',
    learningOutcomes: [
      'Use a basic drawing application to create a digital picture',
      'Save and open a file on a computer or tablet',
      'Create a simple 3–4 slide digital presentation (title, content, images)',
      'Use text and images together to communicate an idea',
      'Practise keyboard/touch typing basic skills',
    ],
    activities: [
      'Digital art — draw a picture using a paint application (Tux Paint/Google Canvas)',
      'Save practice — save a file with a descriptive name in correct folder',
      'Slide show — create 3 slides about "My Favourite Animal" with text and pictures',
      'Typing practice — 5-minute typing exercise on home row keys',
    ],
    assessmentFocus: 'Practical: create and save a 3-slide presentation',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 7',
  },
  {
    week: 8,
    subject: 'Coding & Robotics',
    capsContentArea: 'Algorithms & Coding',
    topic: 'Mini Coding Project — Putting It All Together',
    learningOutcomes: [
      'Plan a mini coding project: define what it should do (decomposition)',
      'Write an algorithm that includes sequences, loops, and at least one condition',
      'Implement the project using a visual coding tool (Scratch Jr, code.org)',
      'Test, debug and improve the project',
      'Present the project and explain how it works',
    ],
    activities: [
      'Project planning — brainstorm, define goal, break into small steps',
      'Code it — implement the project on screen (or on paper if unplugged)',
      'Debugging session — test, find errors, and fix them',
      'Show and tell — present finished project to peers and explain algorithm',
    ],
    assessmentFocus: 'Mini project assessment: plan, code, test, present (rubric)',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 8',
  },
  {
    week: 9,
    subject: 'Coding & Robotics',
    capsContentArea: 'Consolidation',
    topic: 'Revision & Skills Consolidation',
    learningOutcomes: [
      'Revise all four strands: algorithms, robotics, internet safety, application skills',
      'Demonstrate understanding of key vocabulary: algorithm, loop, condition, sensor, input, output, debug',
      'Complete consolidation activities covering Term 3 and 4 content',
      'Collaborate with peers to solve coding challenges',
    ],
    activities: [
      'Vocabulary quiz game — define key coding & robotics terms',
      'Challenge cards — solve 5 mixed coding challenges (sequence, loop, condition)',
      'Peer programming — work in pairs to complete a Scratch Jr challenge',
      'Reflection journal — write about what you learned and enjoyed most',
    ],
    assessmentFocus: 'Revision quiz; practical challenge cards',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 9',
  },
  {
    week: 10,
    subject: 'Coding & Robotics',
    capsContentArea: 'Year-End Assessment',
    topic: 'Year-End Assessment & Celebration',
    learningOutcomes: [
      'Complete year-end formal assessment (practical + written/oral)',
      'Demonstrate computational thinking skills developed across the year',
      'Reflect on growth as a young coder/roboticist',
      'Celebrate achievements and set goals for Grade 4 Coding & Robotics',
    ],
    activities: [
      'Formal assessment — practical coding task + oral questions about concepts',
      'Achievement showcase — display best project/work from the year',
      'Future goals — write "In Grade 4, I want to learn…"',
      'Digital badge ceremony — recognise coding achievements',
    ],
    assessmentFocus: 'Term 4 Formal Assessment (practical + oral/written)',
    capsReference: 'Draft CAPS Coding & Robotics Grade 3; ATP Term 4 Week 10',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXPORT — Full Term 4 ATP Data
// ─────────────────────────────────────────────────────────────────────────────

export const TERM_4_ATP: Term4ATPData = {
  grade: 3,
  term: 4,
  year: 2026,
  subjects: [
    {
      subject: 'Mathematics',
      grade: 3,
      term: 4,
      totalWeeks: 10,
      weeklyPlan: MATHS_TERM4,
    },
    {
      subject: 'English Home Language',
      grade: 3,
      term: 4,
      totalWeeks: 10,
      weeklyPlan: ENGLISH_HL_TERM4,
    },
    {
      subject: 'Afrikaans FAL',
      grade: 3,
      term: 4,
      totalWeeks: 10,
      weeklyPlan: AFRIKAANS_FAL_TERM4,
    },
    {
      subject: 'Life Skills',
      grade: 3,
      term: 4,
      totalWeeks: 10,
      weeklyPlan: LIFE_SKILLS_TERM4,
    },
    {
      subject: 'Coding & Robotics',
      grade: 3,
      term: 4,
      totalWeeks: 10,
      weeklyPlan: CODING_ROBOTICS_TERM4,
    },
  ],
};

// Helper: get all ATP entries for a specific week across all subjects
export function getATPWeek(week: number): ATPWeekEntry[] {
  return TERM_4_ATP.subjects.flatMap(s => s.weeklyPlan.filter(w => w.week === week));
}

// Helper: get all ATP entries for a specific subject
export function getATPBySubject(subject: string): ATPWeekEntry[] {
  const plan = TERM_4_ATP.subjects.find(s => s.subject === subject);
  return plan ? plan.weeklyPlan : [];
}

// Helper: get learning outcomes for a specific week and subject
export function getLearningOutcomes(week: number, subject: string): string[] {
  const entry = TERM_4_ATP.subjects
    .find(s => s.subject === subject)
    ?.weeklyPlan.find(w => w.week === week);
  return entry ? entry.learningOutcomes : [];
}
