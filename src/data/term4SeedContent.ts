/**
 * Pre-loaded seed content for Term 4 — ready-to-use examples
 * that demonstrate weekly content updates aligned to ATP.
 *
 * Parents can use this as a reference, and the app seeds this
 * into localStorage on first load if no custom content exists.
 *
 * Each week has: practice questions, reading excerpts, and objectives.
 */

import type { PracticeQuestion } from './curriculumData';

// ─────────────────────────────────────────────────────────────────────────────
// WEEK 1 — Maths: Place Value & Counting; English: Recount & Fluency
// ─────────────────────────────────────────────────────────────────────────────

export const TERM4_SEED_QUESTIONS: PracticeQuestion[] = [
  // WEEK 1 — MATHS: Place Value (0–999)
  {
    id: 't4w1_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Place Value — Hundreds, Tens, Ones 🔢',
    question: 'What is the value of the digit 7 in the number 736?',
    options: ['7', '70', '700', '736'],
    correctIndex: 2,
    hints: [
      'The 7 is in the hundreds place.',
      'Hundreds place means the digit × 100.',
      '7 × 100 = 700!'
    ],
    explanation: 'The 7 is in the hundreds column, so its value is 700. Great place value thinking!',
    xpAward: 20,
    skill: 'Place value (hundreds, tens, ones)'
  },
  {
    id: 't4w1_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Decompose a 3-Digit Number 🧩',
    question: 'Decompose 584: 584 = ___ + ___ + ___',
    options: ['500 + 80 + 4', '50 + 80 + 4', '508 + 4 + 0', '5 + 8 + 4'],
    correctIndex: 0,
    hints: [
      'Break it into hundreds, tens, and ones.',
      '5 hundreds = 500, 8 tens = 80, 4 ones = 4.',
    ],
    explanation: '584 = 500 + 80 + 4. You expanded the number perfectly!',
    xpAward: 20,
    skill: 'Number decomposition (expanded notation)'
  },
  {
    id: 't4w1_m3',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Counting in 50s ⏩',
    question: 'Count in 50s: 250, 300, 350, ___',
    options: ['360', '400', '450', '500'],
    correctIndex: 1,
    hints: [
      'Add 50 each time.',
      '350 + 50 = ?',
    ],
    explanation: '350 + 50 = 400. The pattern is +50 each time!',
    xpAward: 15,
    skill: 'Counting in 50s'
  },
  {
    id: 't4w1_m4',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Compare Numbers — Greater Than 📊',
    question: 'Which symbol makes this true? 672 ___ 627',
    options: ['<', '>', '=', '≠'],
    correctIndex: 1,
    hints: [
      'Compare the hundreds first: both are 6.',
      'Now compare the tens: 7 vs 2. Which is bigger?',
    ],
    explanation: '672 > 627 because 7 tens is more than 2 tens. Well spotted!',
    xpAward: 15,
    skill: 'Comparing and ordering numbers'
  },

  // WEEK 1 — ENGLISH: Sequencing & Phonics
  {
    id: 't4w1_e1',
    gradeLevel: 3,
    subject: 'english',
    title: 'Sequencing — First, Then, Finally 📖',
    question: 'Which word signals the END of a recount?',
    options: ['First', 'Then', 'Next', 'Finally'],
    correctIndex: 3,
    hints: [
      'Think about the order words: First, Then, Next...',
      'The last one signals the ending!',
    ],
    explanation: '"Finally" signals the end of a recount or sequence. Great sequencing!',
    xpAward: 15,
    skill: 'Sequencing words (recount)'
  },
  {
    id: 't4w1_e2',
    gradeLevel: 3,
    subject: 'english',
    title: 'Long Vowel Pattern — ai/ay 🔤',
    question: 'Which word has the same vowel sound as "train"?',
    options: ['trap', 'play', 'trip', 'tree'],
    correctIndex: 1,
    hints: [
      '"Train" has the long "a" sound spelled "ai".',
      'Look for another word with the long "a" sound!',
    ],
    explanation: '"Play" has the same long "a" sound (spelled "ay"). Both make the "ay" sound!',
    xpAward: 15,
    skill: 'Long vowel patterns (ai/ay)'
  },

  // WEEK 1 — AFRIKAANS: Vocabulary (vakansie)
  {
    id: 't4w1_a1',
    gradeLevel: 3,
    subject: 'afrikaans',
    title: 'Vakansie Woordeskat 🏖️',
    question: 'Wat beteken "strand" in Engels?',
    options: ['Mountain', 'Beach', 'River', 'Forest'],
    correctIndex: 1,
    hints: [
      'Dink aan waar jy swem in die see.',
      '"Strand" is waar sand en water ontmoet!',
    ],
    explanation: '"Strand" = Beach. Lekker strandpret! 🏖️',
    xpAward: 20,
    skill: 'Afrikaans vocabulary (vakansie/holiday)'
  },

  // WEEK 1 — ROBOTICS: Algorithms revision
  {
    id: 't4w1_r1',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Algorithm Order 📋',
    question: 'An algorithm must have instructions that are:',
    options: ['Random', 'In a clear order (sequence)', 'Backwards', 'Only one step'],
    correctIndex: 1,
    hints: [
      'Think about following a recipe — does order matter?',
      'Algorithms need steps in the right sequence!',
    ],
    explanation: 'An algorithm has instructions in a clear order (sequence). Order matters!',
    xpAward: 15,
    skill: 'Algorithms & Sequences (revision)'
  },

  // WEEK 2 — MATHS: Addition & Subtraction (3-digit)
  {
    id: 't4w2_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Addition — 3-Digit Numbers ➕',
    question: 'Solve: 347 + 235 = ?',
    options: ['572', '582', '592', '682'],
    correctIndex: 1,
    hints: [
      'Add ones first: 7 + 5 = 12. Write 2, carry 1.',
      'Add tens: 1 + 4 + 3 = 8 tens.',
      'Add hundreds: 3 + 2 = 5 hundreds. Total = 582!',
    ],
    explanation: '347 + 235 = 582. Brilliant column addition!',
    xpAward: 25,
    skill: '3-digit addition with carrying'
  },
  {
    id: 't4w2_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Subtraction — 3-Digit Numbers ➖',
    question: 'Solve: 814 − 367 = ?',
    options: ['447', '457', '547', '443'],
    correctIndex: 0,
    hints: [
      'Ones: 4 − 7... you need to borrow! 14 − 7 = 7.',
      'Tens: 0 − 6... borrow again! 10 − 6 = 4.',
      'Hundreds: 7 − 3 = 4. Answer = 447!',
    ],
    explanation: '814 − 367 = 447. Excellent regrouping!',
    xpAward: 25,
    skill: '3-digit subtraction with regrouping'
  },
  {
    id: 't4w2_m3',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Word Problem — Addition 🛒',
    question: 'Sipho has 456 stickers. He gets 278 more. How many stickers does he have now?',
    options: ['724', '734', '634', '744'],
    correctIndex: 1,
    hints: [
      'This is an addition problem: 456 + 278.',
      'Add ones: 6 + 8 = 14. Carry 1.',
      'Tens: 1 + 5 + 7 = 13. Carry 1. Hundreds: 1 + 4 + 2 = 7.',
    ],
    explanation: '456 + 278 = 734 stickers! Great problem solving!',
    xpAward: 25,
    skill: 'Addition word problems (3-digit)'
  },

  // WEEK 2 — ENGLISH: Narrative Writing
  {
    id: 't4w2_e1',
    gradeLevel: 3,
    subject: 'english',
    title: 'Story Structure 📖',
    question: 'Every narrative (story) needs a beginning, middle and ___.',
    options: ['Top', 'End', 'Side', 'Extra'],
    correctIndex: 1,
    hints: [
      'A story starts, something happens, and then it...',
      'The last part wraps up the story!',
    ],
    explanation: 'A narrative has a beginning, middle, and END. That\'s story structure!',
    xpAward: 15,
    skill: 'Narrative structure (beginning, middle, end)'
  },
  {
    id: 't4w2_e2',
    gradeLevel: 3,
    subject: 'english',
    title: 'Adjectives — Describing Words ✨',
    question: 'Which word is an adjective in: "The tall giraffe ate green leaves"?',
    options: ['giraffe', 'ate', 'tall', 'leaves'],
    correctIndex: 2,
    hints: [
      'An adjective describes a noun (person, place, or thing).',
      'Which word tells you what the giraffe looks like?',
    ],
    explanation: '"Tall" is an adjective — it describes the giraffe!',
    xpAward: 15,
    skill: 'Adjectives (describing words)'
  },

  // WEEK 3 — MATHS: Multiplication & Division
  {
    id: 't4w3_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Multiplication ×5 ✖️',
    question: 'Solve: 7 × 5 = ?',
    options: ['30', '35', '40', '25'],
    correctIndex: 1,
    hints: [
      'Count in 5s: 5, 10, 15, 20, 25, 30, 35.',
      'The 7th number in the 5× table is 35!',
    ],
    explanation: '7 × 5 = 35. You know your 5 times table!',
    xpAward: 20,
    skill: 'Multiplication (×5 table)'
  },
  {
    id: 't4w3_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Division — Equal Sharing ➗',
    question: '24 sweets shared equally among 4 children. How many does each child get?',
    options: ['5', '6', '7', '8'],
    correctIndex: 1,
    hints: [
      'Division means sharing equally.',
      '24 ÷ 4 = ? Think: 4 × ? = 24.',
    ],
    explanation: '24 ÷ 4 = 6. Each child gets 6 sweets. Fair sharing!',
    xpAward: 20,
    skill: 'Division (equal sharing)'
  },
  {
    id: 't4w3_m3',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Fact Family — ×3 🔄',
    question: 'If 3 × 8 = 24, what is 24 ÷ 3?',
    options: ['6', '7', '8', '9'],
    correctIndex: 2,
    hints: [
      'Division is the inverse (opposite) of multiplication.',
      'If 3 × 8 = 24, then 24 ÷ 3 = 8!',
    ],
    explanation: '24 ÷ 3 = 8. Multiplication and division are fact families!',
    xpAward: 20,
    skill: 'Fact families (multiplication/division)'
  },

  // WEEK 3 — ENGLISH: Past Tense & Diary Writing
  {
    id: 't4w3_e1',
    gradeLevel: 3,
    subject: 'english',
    title: 'Past Tense — Regular Verbs 📝',
    question: 'What is the past tense of "walk"?',
    options: ['walking', 'walked', 'walks', 'will walk'],
    correctIndex: 1,
    hints: [
      'Regular past tense verbs add "-ed" at the end.',
      'Walk + ed = ?',
    ],
    explanation: '"Walked" is the past tense. Add -ed for regular verbs!',
    xpAward: 15,
    skill: 'Past tense (regular verbs with -ed)'
  },
  {
    id: 't4w3_e2',
    gradeLevel: 3,
    subject: 'english',
    title: 'Irregular Past Tense ⚡',
    question: 'What is the past tense of "go"?',
    options: ['goed', 'went', 'goes', 'going'],
    correctIndex: 1,
    hints: [
      '"Go" is irregular — it doesn\'t just add -ed.',
      'Yesterday I ___ to the shop.',
    ],
    explanation: 'The past tense of "go" is "went". Irregular verbs change completely!',
    xpAward: 20,
    skill: 'Irregular past tense verbs'
  },

  // WEEK 3 — AFRIKAANS: Food (Kos)
  {
    id: 't4w3_a1',
    gradeLevel: 3,
    subject: 'afrikaans',
    title: 'Kos — Ek hou van... 🍎',
    question: 'Hoe sê jy "I like bread" in Afrikaans?',
    options: ['Ek hou van brood', 'Ek het brood', 'Ek is brood', 'Ek eet brood'],
    correctIndex: 0,
    hints: [
      '"I like" = "Ek hou van".',
      '"Bread" = "brood".',
    ],
    explanation: '"Ek hou van brood" = I like bread. Lekker!',
    xpAward: 20,
    skill: 'Afrikaans sentence construction (Ek hou van...)'
  },

  // WEEK 4 — MATHS: Common Fractions
  {
    id: 't4w4_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Fractions — Parts of a Whole 🍕',
    question: 'A pizza is cut into 8 equal slices. You eat 3. What fraction did you eat?',
    options: ['3/5', '3/8', '5/8', '8/3'],
    correctIndex: 1,
    hints: [
      'The bottom number (denominator) = total slices = 8.',
      'The top number (numerator) = slices you ate = 3.',
    ],
    explanation: 'You ate 3/8 of the pizza. Numerator (eaten) over denominator (total)!',
    xpAward: 25,
    skill: 'Common fractions (parts of a whole)'
  },
  {
    id: 't4w4_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Comparing Fractions 📊',
    question: 'Which fraction is bigger: 2/4 or 3/4?',
    options: ['2/4', '3/4', 'They are equal', 'Cannot tell'],
    correctIndex: 1,
    hints: [
      'When denominators are the same, compare the numerators.',
      '3 is bigger than 2, so 3/4 > 2/4.',
    ],
    explanation: '3/4 > 2/4. Same denominator? Bigger numerator wins!',
    xpAward: 20,
    skill: 'Comparing fractions (same denominator)'
  },

  // WEEK 5 — MATHS: Capacity
  {
    id: 't4w5_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Capacity — Litres & Millilitres 🥤',
    question: 'How many millilitres are in 1 litre?',
    options: ['10 ml', '100 ml', '1 000 ml', '10 000 ml'],
    correctIndex: 2,
    hints: [
      'Think: "milli" means one-thousandth.',
      '1 litre = 1 000 millilitres!',
    ],
    explanation: '1 litre = 1 000 ml. That\'s a full large bottle!',
    xpAward: 20,
    skill: 'Capacity (litres and millilitres)'
  },
  {
    id: 't4w5_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Capacity Problem 🧃',
    question: 'A jug holds 2 litres. A cup holds 250 ml. How many cups fill the jug?',
    options: ['4 cups', '6 cups', '8 cups', '10 cups'],
    correctIndex: 2,
    hints: [
      '2 litres = 2 000 ml.',
      '2 000 ÷ 250 = ?',
    ],
    explanation: '2 000 ml ÷ 250 ml = 8 cups. Great measurement thinking!',
    xpAward: 25,
    skill: 'Capacity word problems'
  },

  // WEEK 6 — MATHS: Mass
  {
    id: 't4w6_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Mass — Kilograms & Grams ⚖️',
    question: 'How many grams are in 1 kilogram?',
    options: ['10 g', '100 g', '1 000 g', '10 000 g'],
    correctIndex: 2,
    hints: [
      '"Kilo" means thousand.',
      '1 kilogram = 1 000 grams!',
    ],
    explanation: '1 kg = 1 000 g. A bag of sugar weighs about 1 kg!',
    xpAward: 20,
    skill: 'Mass (kilograms and grams)'
  },

  // WEEK 7 — MATHS: Patterns
  {
    id: 't4w7_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Number Pattern — Rule Finding 🔍',
    question: 'What is the rule? 5, 10, 15, 20, 25, ___',
    options: ['+3', '+5', '+10', '×2'],
    correctIndex: 1,
    hints: [
      'Look at the difference between each number.',
      '10 − 5 = 5, 15 − 10 = 5, 20 − 15 = 5...',
    ],
    explanation: 'The rule is +5. The pattern adds 5 each time!',
    xpAward: 20,
    skill: 'Number patterns (identifying rules)'
  },

  // WEEK 8 — MATHS: 3-D Objects
  {
    id: 't4w8_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: '3-D Objects — Faces & Edges 📦',
    question: 'How many faces does a rectangular prism (box) have?',
    options: ['4', '5', '6', '8'],
    correctIndex: 2,
    hints: [
      'Think of a cereal box. Count all the flat surfaces.',
      'Top, bottom, front, back, left side, right side...',
    ],
    explanation: 'A rectangular prism has 6 faces. You can count them on any box!',
    xpAward: 20,
    skill: '3-D objects (properties)'
  },

  // WEEK 9 — MATHS: Data Handling
  {
    id: 't4w9_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Reading a Pictograph 📊',
    question: 'In a pictograph, 🍎 = 2 apples. If a row shows 🍎🍎🍎, how many apples is that?',
    options: ['3', '4', '5', '6'],
    correctIndex: 3,
    hints: [
      'Each picture represents 2 apples.',
      '3 pictures × 2 apples each = ?',
    ],
    explanation: '3 × 2 = 6 apples. Remember to multiply by the key value!',
    xpAward: 20,
    skill: 'Data handling (reading pictographs)'
  },

  // WEEK 5 — AFRIKAANS: Body parts (Liggaamsdele)
  {
    id: 't4w5_a1',
    gradeLevel: 3,
    subject: 'afrikaans',
    title: 'Liggaamsdele — Body Parts 🦶',
    question: 'Wat is "voete" in Engels?',
    options: ['Hands', 'Feet', 'Eyes', 'Ears'],
    correctIndex: 1,
    hints: [
      '"Voete" is die meervoud van "voet".',
      'Jy stap met jou ___.',
    ],
    explanation: '"Voete" = Feet. Baie goed!',
    xpAward: 15,
    skill: 'Afrikaans body parts vocabulary'
  },

  // WEEK 6 — AFRIKAANS: Weather (Die Weer)
  {
    id: 't4w6_a1',
    gradeLevel: 3,
    subject: 'afrikaans',
    title: 'Die Weer — Weather 🌤️',
    question: 'Hoe sê jy "It is sunny" in Afrikaans?',
    options: ['Dit is koud', 'Dit is sonnig', 'Dit is bewolk', 'Dit is winderig'],
    correctIndex: 1,
    hints: [
      '"Sunny" = "sonnig" (van die son).',
      '"Dit is" = "It is".',
    ],
    explanation: '"Dit is sonnig" = It is sunny. ☀️ Lekker weer!',
    xpAward: 15,
    skill: 'Afrikaans weather vocabulary'
  },

  // WEEK 2 — ROBOTICS: IF-THEN conditions
  {
    id: 't4w2_r1',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'IF-THEN Conditions 🚦',
    question: 'IF the traffic light is red THEN the robot should:',
    options: ['Speed up', 'Stop', 'Turn left', 'Jump'],
    correctIndex: 1,
    hints: [
      'Think about what YOU do at a red traffic light.',
      'Red means stop!',
    ],
    explanation: 'IF red THEN stop. Conditions tell the robot what to do when something is true!',
    xpAward: 20,
    skill: 'Conditions (IF-THEN)'
  },

  // WEEK 4 — ROBOTICS: Sensors
  {
    id: 't4w4_r1',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Sensor Input 📡',
    question: 'A distance sensor on a robot detects a wall 10cm away. This is an example of:',
    options: ['An output', 'An input', 'A loop', 'A variable'],
    correctIndex: 1,
    hints: [
      'The sensor gives information TO the robot.',
      'Information coming IN to the robot is called an input!',
    ],
    explanation: 'The sensor reading is an INPUT — it gives the robot information about its surroundings!',
    xpAward: 20,
    skill: 'Inputs and outputs (sensors)'
  },

  // VIBING — Week 3: Loops with conditions
  {
    id: 't4w3_v1',
    gradeLevel: 3,
    subject: 'vibing',
    title: 'Repeat Until Loop 🔁',
    question: 'What does "Repeat UNTIL you reach the wall" mean?',
    options: [
      'Do nothing',
      'Move once and stop',
      'Keep moving forward until the wall is reached',
      'Move backwards'
    ],
    correctIndex: 2,
    hints: [
      '"Repeat UNTIL" means keep going until a condition becomes true.',
      'The robot keeps moving until it reaches the wall!',
    ],
    explanation: '"Repeat UNTIL" loops keep repeating an action until the condition is met!',
    xpAward: 20,
    skill: 'Loops with conditions (repeat until)'
  },
];

/**
 * Seeds the custom practice questions into localStorage if they don't exist yet.
 * Called once from App initialization.
 */
export function seedTerm4Content(): void {
  const key = 'explorer_custom_practice_v1';
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (existing.length === 0) {
      localStorage.setItem(key, JSON.stringify(TERM4_SEED_QUESTIONS));
    }
  } catch {
    localStorage.setItem(key, JSON.stringify(TERM4_SEED_QUESTIONS));
  }
}
