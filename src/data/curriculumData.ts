export interface LifeSkillsWeeklyTheme {
  term: number;
  week: number;
  theme: string;
  topic: string;
  description: string;
  activities: string[];
}

export const LIFE_SKILLS_WEEKLY_THEMES: LifeSkillsWeeklyTheme[] = [
  // TERM 1 — Beginning Knowledge
  { term: 1, week: 1, theme: 'Beginning Knowledge', topic: 'About Me', description: 'Discover what makes you special — your name, family, and favourite things.', activities: ['Draw a self-portrait', 'Write 3 things that make me unique', 'Interview a family member'] },
  { term: 1, week: 2, theme: 'Beginning Knowledge', topic: 'My Body & Senses', description: 'Learn how your five senses help you explore the world.', activities: ['Senses scavenger hunt', 'Label body parts on a poster', 'Taste-test challenge (sweet, sour, salty)'] },
  { term: 1, week: 3, theme: 'Beginning Knowledge', topic: 'Healthy Living', description: 'Understand healthy eating, exercise, and rest.', activities: ['Plan a healthy lunchbox', 'Track glasses of water for a week', 'Design an exercise poster'] },
  { term: 1, week: 4, theme: 'Beginning Knowledge', topic: 'Safety at Home', description: 'Identify dangers in the home and how to stay safe.', activities: ['Draw a safe-home checklist', 'Role-play calling for help', 'Fire drill practice'] },
  { term: 1, week: 5, theme: 'Beginning Knowledge', topic: 'Safety on the Road', description: 'Road rules, crossing safely, and being visible.', activities: ['Learn pedestrian rules', 'Spot traffic signs on a walk', 'Draw reflective clothing'] },
  { term: 1, week: 6, theme: 'Beginning Knowledge', topic: 'My Rights & Responsibilities', description: 'Children\'s rights and responsibilities at school and home.', activities: ['Class rules poster', 'Discuss fairness scenarios', 'Write a responsibility pledge'] },
  { term: 1, week: 7, theme: 'Beginning Knowledge', topic: 'Emotions & Feelings', description: 'Name feelings, recognise them in others, and find healthy ways to cope.', activities: ['Emotions charades', 'Feelings journal page', 'Breathing exercise practice'] },
  { term: 1, week: 8, theme: 'Beginning Knowledge', topic: 'Being a Good Friend', description: 'What friendship means — sharing, listening, and kindness.', activities: ['Friendship collage', 'Write a thank-you note', 'Compliment circle game'] },
  { term: 1, week: 9, theme: 'Beginning Knowledge', topic: 'My Community Helpers', description: 'People who keep our community safe and running.', activities: ['Interview a helper (parent/nurse/police)', 'Draw community helpers', 'Thank-you card for a helper'] },
  { term: 1, week: 10, theme: 'Beginning Knowledge', topic: 'Celebrations & Traditions', description: 'Different cultural celebrations in South Africa.', activities: ['Share a family tradition', 'Heritage day dress-up', 'Cook a traditional recipe together'] },
  { term: 1, week: 11, theme: 'Beginning Knowledge', topic: 'Term Reflection', description: 'Look back at what you learned and set goals for next term.', activities: ['Draw your favourite lesson', 'Write 2 goals for Term 2', 'Share a proud moment'] },

  // TERM 2 — Social Sciences
  { term: 2, week: 1, theme: 'Social Sciences', topic: 'Maps & Directions', description: 'Read simple maps, understand left/right/north/south.', activities: ['Draw a map of your bedroom', 'Treasure hunt with directions', 'Label compass directions'] },
  { term: 2, week: 2, theme: 'Social Sciences', topic: 'Our Neighbourhood', description: 'Landmarks, shops, and services in the local area.', activities: ['Walk-and-sketch neighbourhood map', 'Interview a shopkeeper', 'Compare rural and urban areas'] },
  { term: 2, week: 3, theme: 'Social Sciences', topic: 'Weather & Seasons', description: 'Types of weather, seasons in South Africa, and how they affect daily life.', activities: ['Weekly weather chart', 'Dress the paper doll for each season', 'Rain gauge experiment'] },
  { term: 2, week: 4, theme: 'Social Sciences', topic: 'Water — Our Precious Resource', description: 'The water cycle and why we must save water.', activities: ['Water cycle diagram', 'Count taps left running at home', 'Design a "Save Water" poster'] },
  { term: 2, week: 5, theme: 'Social Sciences', topic: 'Plants & Growth', description: 'What plants need to grow and why they matter.', activities: ['Plant a bean in a cup', 'Label parts of a plant', 'Observe growth over 2 weeks'] },
  { term: 2, week: 6, theme: 'Social Sciences', topic: 'Animals & Habitats', description: 'South African animals and where they live.', activities: ['Sort animals by habitat', 'Research a favourite SA animal', 'Build a diorama'] },
  { term: 2, week: 7, theme: 'Social Sciences', topic: 'Recycling & the Environment', description: 'Reduce, reuse, recycle — caring for our planet.', activities: ['Sort recyclable items', 'Make art from recycled materials', 'Litter audit in the garden'] },
  { term: 2, week: 8, theme: 'Social Sciences', topic: 'Transport Then & Now', description: 'How people travelled long ago vs today.', activities: ['Timeline of transport', 'Compare ox wagon to car', 'Design a future vehicle'] },
  { term: 2, week: 9, theme: 'Social Sciences', topic: 'Communication', description: 'From smoke signals to smartphones — how we share information.', activities: ['Send a coded message', 'Compare old and new phones', 'Write and post a real letter'] },
  { term: 2, week: 10, theme: 'Social Sciences', topic: 'South African Heritage', description: 'Famous landmarks and important people.', activities: ['Research Nelson Mandela', 'Draw the flag and explain colours', 'Visit a virtual museum'] },
  { term: 2, week: 11, theme: 'Social Sciences', topic: 'Term Reflection', description: 'Consolidate learning and celebrate discoveries.', activities: ['Social Sciences quiz game', 'Present favourite topic to family', 'Set Term 3 goals'] },

  // TERM 3 — Creative Arts
  { term: 3, week: 1, theme: 'Creative Arts', topic: 'Visual Arts — Colour & Shape', description: 'Explore primary and secondary colours and basic shapes in art.', activities: ['Colour mixing experiment', 'Shape collage', 'Paint a colour wheel'] },
  { term: 3, week: 2, theme: 'Creative Arts', topic: 'Visual Arts — Patterns & Texture', description: 'Find patterns in nature and create textured art.', activities: ['Leaf rubbing art', 'Design a repeating pattern', 'Texture scavenger hunt'] },
  { term: 3, week: 3, theme: 'Creative Arts', topic: 'Visual Arts — Drawing & Observation', description: 'Draw what you see — still life and nature sketching.', activities: ['Draw a fruit bowl', 'Sketch your pet or toy', 'Blind contour drawing game'] },
  { term: 3, week: 4, theme: 'Creative Arts', topic: 'Performing Arts — Movement', description: 'Express feelings through dance and creative movement.', activities: ['Animal movement game', 'Create a short dance routine', 'Freeze-frame sculptures'] },
  { term: 3, week: 5, theme: 'Creative Arts', topic: 'Performing Arts — Drama', description: 'Storytelling through acting and role-play.', activities: ['Act out a favourite story', 'Puppet show with socks', 'Improvisation game'] },
  { term: 3, week: 6, theme: 'Creative Arts', topic: 'Music — Rhythm & Beat', description: 'Feel the beat — clapping, tapping, and body percussion.', activities: ['Clap-back rhythm game', 'Make a shaker instrument', 'Learn a rhythm pattern'] },
  { term: 3, week: 7, theme: 'Creative Arts', topic: 'Music — Singing & Melody', description: 'South African songs and vocal exploration.', activities: ['Learn a Zulu lullaby', 'Sing-along with actions', 'Record your own song'] },
  { term: 3, week: 8, theme: 'Creative Arts', topic: 'Craft & Design', description: 'Use recycled materials to design and build.', activities: ['Build a robot from boxes', 'Weave a paper placemat', 'Design a mask'] },
  { term: 3, week: 9, theme: 'Creative Arts', topic: 'Digital Art & Photography', description: 'Take photos, edit, and create digital art.', activities: ['Photo walk (5 best shots)', 'Edit a photo with filters', 'Design a digital greeting card'] },
  { term: 3, week: 10, theme: 'Creative Arts', topic: 'Arts Showcase', description: 'Present and celebrate your best creative work from this term.', activities: ['Set up a mini gallery', 'Perform for family', 'Write artist statements'] },

  // TERM 4 — Personal & Social Well-being
  { term: 4, week: 1, theme: 'Personal & Social Well-being', topic: 'Relationships', description: 'Healthy relationships with family, friends, and teachers.', activities: ['Relationship web diagram', 'Write about your best friend', 'Discuss boundaries'] },
  { term: 4, week: 2, theme: 'Personal & Social Well-being', topic: 'Responsibilities at Home', description: 'Helping at home and being a responsible family member.', activities: ['Chore chart for a week', 'Cook a simple meal together', 'Time management exercise'] },
  { term: 4, week: 3, theme: 'Personal & Social Well-being', topic: 'Conflict Resolution', description: 'Solve disagreements peacefully using words.', activities: ['Role-play conflict scenarios', 'I-message practice', 'Peace treaty writing'] },
  { term: 4, week: 4, theme: 'Personal & Social Well-being', topic: 'Bullying Awareness', description: 'What bullying is, how to respond, and how to be an upstander.', activities: ['Define bully vs conflict', 'Create anti-bullying poster', 'Practice saying "Stop"'] },
  { term: 4, week: 5, theme: 'Personal & Social Well-being', topic: 'Online Safety', description: 'Staying safe on the internet and with devices.', activities: ['Personal info quiz (share or secret?)', 'Design safe-password rules', 'Screen time tracker'] },
  { term: 4, week: 6, theme: 'Personal & Social Well-being', topic: 'Goal Setting & Growth', description: 'Set personal goals and track progress with a growth mindset.', activities: ['Vision board collage', 'Write SMART goals', '"Yet" mindset journal'] },
  { term: 4, week: 7, theme: 'Personal & Social Well-being', topic: 'Money & Saving', description: 'Basic money sense — needs vs wants, saving, and spending wisely.', activities: ['Needs vs wants sorting', 'Design a savings jar', 'Play shop with pretend money'] },
  { term: 4, week: 8, theme: 'Personal & Social Well-being', topic: 'Giving Back', description: 'Community service, charity, and making a difference.', activities: ['Plan a kindness challenge', 'Donate old toys/books', 'Write thank-you letters to helpers'] },
  { term: 4, week: 9, theme: 'Personal & Social Well-being', topic: 'Looking After Our Earth', description: 'Environmental responsibility and future thinking.', activities: ['Pledge poster for the planet', 'Plant something that lasts', 'Calculate your family carbon actions'] },
  { term: 4, week: 10, theme: 'Personal & Social Well-being', topic: 'Year Reflection & Celebration', description: 'Celebrate growth, memories, and friendships from the whole year.', activities: ['Year-in-review scrapbook page', 'Awards ceremony with family', 'Letter to future self'] },
];

export interface TeachingVideo {
  provider: 'youtube' | 'parent-created';
  youtubeUrl?: string;
  youtubeSearchQuery: string;
  title: string;
  durationMinutes?: number;
  parentReviewed: boolean;
  fallbackBrief?: string;
}

export interface PracticeQuestion {
  id: string;
  gradeLevel: 3 | 4;
  subject: 'maths' | 'english' | 'afrikaans' | 'robotics' | 'vibing';
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
  xpAward: number;
  skill: string;
  themeTag?: string; // Matches the Life Skills weekly theme (e.g. "drawing-observation", "movement-dance") for themed content filtering
  contentAllocation?: 'core' | 'opportunity' | 'stretch';
  activityFormat?: 'multiple-choice' | 'missing-fields' | 'question-and-answer' | 'connecting-fields';
  acceptedAnswers?: string[];
  matchingPairs?: Array<{ left: string; right: string }>;
  teachingVideo?: TeachingVideo;
}

export interface ReadingStory {
  id: string;
  weekNumber: number; // Week 1 to 12
  storySlot?: 'A' | 'B'; // First or second story of the week (long stories)
  storyNumber?: 1 | 2; // Story number within a week (short rotational stories)
  title: string;
  emoji: string;
  readingTimeMinutes: number;
  content: string[]; // Array of paragraphs, 15-20 paragraphs each
  // Short stories use quizQuestions
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  // Long stories use day1/day2 questions
  day1Questions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  day2Questions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const PRACTICE_BANK: PracticeQuestion[] = [
  // --- GRADE 3 MATHS ---
  {
    id: 'g3_m1',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Subtraction with Regrouping 🔢',
    question: 'Solve: 52 - 27 = ?',
    options: ['25', '35', '27', '32'],
    correctIndex: 0,
    hints: [
      'Look at the ones column first: 2 minus 7. Since 2 is smaller than 7, borrow 1 ten from 50!',
      '5 tens become 4 tens, and 2 ones become 12 ones. Now subtract: 12 - 7 = 5.',
      'Now subtract the tens column: 4 tens minus 2 tens = 2 tens. Put them together!'
    ],
    explanation: 'Great job! 52 - 27 = 25. You successfully regrouped 1 ten into 10 ones!',
    xpAward: 20,
    skill: 'Two-digit subtraction with regrouping'
  },
  {
    id: 'g3_m2',
    gradeLevel: 3,
    subject: 'maths',
    title: 'Addition with Carrying ➕',
    question: 'Solve: 48 + 37 = ?',
    options: ['75', '85', '81', '76'],
    correctIndex: 1,
    hints: [
      'Add the ones first: 8 + 7 = 15 ones.',
      '15 ones is 1 ten and 5 ones. Carry 1 ten to the tens column.',
      'Add the tens: 1 + 4 + 3 = 8 tens. Total = 85!'
    ],
    explanation: 'Awesome work! 48 + 37 = 85. You carried the 1 ten perfectly!',
    xpAward: 20,
    skill: 'Two-digit addition with carrying'
  },

  // --- GRADE 4 MATHS (Multiplication, Division, Fractions) ---
  {
    id: 'g4_m1',
    gradeLevel: 4,
    subject: 'maths',
    title: 'Multi-Digit Multiplication ✖️',
    question: 'Solve: 14 × 6 = ?',
    options: ['74', '84', '94', '64'],
    correctIndex: 1,
    hints: [
      'Break down 14 into (10 + 4).',
      'Multiply: 10 × 6 = 60, and 4 × 6 = 24.',
      'Now add the two totals together: 60 + 24 = 84!'
    ],
    explanation: 'Outstanding! 14 × 6 = 84. Partitioning numbers makes multiplication easy!',
    xpAward: 30,
    skill: 'Grade 4 Multiplication'
  },
  {
    id: 'g4_m2',
    gradeLevel: 4,
    subject: 'maths',
    title: 'Equal Sharing & Division ➗',
    question: 'Solve: 84 ÷ 4 = ?',
    options: ['21', '22', '18', '24'],
    correctIndex: 0,
    hints: [
      'Divide the tens first: 8 tens ÷ 4 = 2 tens (20).',
      'Divide the ones: 4 ones ÷ 4 = 1 one.',
      'Combine them: 20 + 1 = 21!'
    ],
    explanation: 'Spot on! 84 ÷ 4 = 21. Excellent division skills!',
    xpAward: 30,
    skill: 'Grade 4 Division'
  },
  {
    id: 'g4_m3',
    gradeLevel: 4,
    subject: 'maths',
    title: 'Intro to Fractions 🍕',
    question: 'What fraction of a pizza is left if you eat 1 out of 4 equal slices?',
    options: ['1/2', '3/4', '1/4', '2/4'],
    correctIndex: 1,
    hints: [
      'A whole pizza has 4 slices (4/4).',
      'Subtract 1 slice: 4 slices minus 1 slice = 3 slices.',
      'So 3 out of 4 slices remain: 3/4!'
    ],
    explanation: 'Brilliant! 3/4 of the pizza is remaining!',
    xpAward: 25,
    skill: 'Grade 4 Fractions'
  },

  // --- ENGLISH (Grade 3 & Grade 4) ---
  {
    id: 'g3_e1',
    gradeLevel: 3,
    subject: 'english',
    title: 'Vocabulary & Context 🇬🇧',
    question: 'Choose the word that best completes the sentence: "The brave explorer climbed up the ________ mountain."',
    options: ['steep', 'sleep', 'sweet', 'slow'],
    correctIndex: 0,
    hints: [
      'Think about what a mountain looks like when it goes straight up.',
      '"Steep" means rising or falling sharply!'
    ],
    explanation: 'Correct! "Steep" describes a high, sharp mountain!',
    xpAward: 15,
    skill: 'Adjectives and context clues'
  },
  {
    id: 'g4_e1',
    gradeLevel: 4,
    subject: 'english',
    title: 'Parts of Speech: Action Verbs 🏃',
    question: 'Which word in this sentence is a verb (action word)? "The energetic cheetah sprinted across the savanna."',
    options: ['cheetah', 'energetic', 'sprinted', 'savanna'],
    correctIndex: 2,
    hints: [
      'A verb is a doing or action word.',
      'What did the cheetah DO?',
      'It "sprinted"!'
    ],
    explanation: 'Awesome! "Sprinted" is an action verb!',
    xpAward: 25,
    skill: 'Grade 4 Grammar & Action Verbs'
  },

  // --- AFRIKAANS (Grade 3 & Grade 4) ---
  {
    id: 'g3_a1',
    gradeLevel: 3,
    subject: 'afrikaans',
    title: 'Diere & Kleure 🇿🇦',
    question: 'Wat is die Afrikaanse woord vir "The green frog"?',
    options: ['Die rooi kat', 'Die groen padda', 'Die blou hond', 'Die geel voël'],
    correctIndex: 1,
    hints: [
      'Green = groen, Frog = padda.',
      'Put them together: "Die groen padda"!'
    ],
    explanation: 'Mooi so! "The green frog" is "Die groen padda"!',
    xpAward: 20,
    skill: 'Afrikaans Grade 3 Vocabulary'
  },
  {
    id: 'g4_a1',
    gradeLevel: 4,
    subject: 'afrikaans',
    title: 'Meervoude (Plurals) 🇿🇦',
    question: 'Wat is die meervoud van "hond"?',
    options: ['honde', 'hondies', 'honde-s', 'honderd'],
    correctIndex: 0,
    hints: [
      'In Afrikaans, many short words get "-e" at the end for plural.',
      'Hond + e = honde!'
    ],
    explanation: 'Uitstekend! Een hond, baie honde!',
    xpAward: 25,
    skill: 'Grade 4 Afrikaans Meervoude'
  },

  // --- ROBOTICS (Grade 3 & 4 — CAPS Technology / Coding & Robotics) ---
  {
    id: 'g3_r1',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'What is an Algorithm? 🤖',
    question: 'An algorithm is like a...',
    options: ['A recipe with step-by-step instructions', 'A type of robot', 'A computer screen', 'A battery'],
    correctIndex: 0,
    hints: ['Think about how you follow steps to make a sandwich.', 'An algorithm is a set of instructions in order!'],
    explanation: 'Correct! An algorithm is a set of step-by-step instructions, just like a recipe!',
    xpAward: 20,
    skill: 'Algorithms & Sequences'
  },
  {
    id: 'g3_r2',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Correct Sequence 🤖',
    question: 'To brush your teeth, which step comes FIRST?',
    options: ['Rinse your mouth', 'Pick up the toothbrush', 'Spit out the paste', 'Put the brush away'],
    correctIndex: 1,
    hints: ['You need to hold something before you can use it!', 'The first step is always getting your tool ready.'],
    explanation: 'Well done! You must pick up the toothbrush first — sequence matters in algorithms!',
    xpAward: 20,
    skill: 'Algorithms & Sequences'
  },
  {
    id: 'g3_r3',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Inputs & Outputs 🎮',
    question: 'When you press a button on a remote control, what is the INPUT?',
    options: ['The TV turning on', 'The button press', 'The sound from the TV', 'The remote control battery'],
    correctIndex: 1,
    hints: ['An input is what YOU do or give to a device.', 'Pressing the button is the action you perform!'],
    explanation: 'Brilliant! The button press is the INPUT. The TV turning on is the OUTPUT!',
    xpAward: 20,
    skill: 'Inputs & Outputs'
  },
  {
    id: 'g3_r4',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Robot Outputs 📺',
    question: 'A robot arm picks up a ball. What is the OUTPUT?',
    options: ['The command to pick up', 'The ball being lifted', 'The programmer typing', 'The robot turning on'],
    correctIndex: 1,
    hints: ['An output is what the machine DOES after receiving instructions.', 'The result or action is the output!'],
    explanation: 'Spot on! The ball being lifted is the OUTPUT — it\'s the result of the instruction!',
    xpAward: 20,
    skill: 'Inputs & Outputs'
  },
  {
    id: 'g3_r5',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Simple Loops 🔁',
    question: 'What does "Repeat 3 times: clap" mean?',
    options: ['Clap once', 'Clap three times', 'Clap forever', 'Don\'t clap'],
    correctIndex: 1,
    hints: ['A loop repeats an action a set number of times.', '"Repeat 3 times" means do it 3 times!'],
    explanation: 'Great! A loop repeats the action — "Repeat 3 times: clap" means clap, clap, clap!',
    xpAward: 20,
    skill: 'Loops & Patterns'
  },
  {
    id: 'g3_r6',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Pattern Recognition 🔄',
    question: 'What comes next in this pattern? ⬆️ ➡️ ⬆️ ➡️ ⬆️ ___',
    options: ['⬆️', '➡️', '⬇️', '⬅️'],
    correctIndex: 1,
    hints: ['Look at the pattern: up, right, up, right...', 'The pattern alternates between two directions!'],
    explanation: 'The pattern is ⬆️ ➡️ repeating — so next is ➡️!',
    xpAward: 20,
    skill: 'Loops & Patterns'
  },
  {
    id: 'g4_r1',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Problem Solving Steps 🧩',
    question: 'What is the FIRST step in solving a coding problem?',
    options: ['Write code immediately', 'Understand the problem', 'Test the solution', 'Ask for help'],
    correctIndex: 1,
    hints: ['Before you can solve something, you need to know what the problem IS.', 'Read and understand first, then plan!'],
    explanation: 'Correct! Always understand the problem first, then plan, code, and test!',
    xpAward: 25,
    skill: 'Problem-Solving Steps'
  },
  {
    id: 'g4_r2',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Debugging 🐛',
    question: 'A robot should go: Forward, Forward, Turn Right. But it goes: Forward, Turn Right, Forward. What is the bug?',
    options: ['Steps 2 and 3 are swapped', 'Step 1 is wrong', 'There are too many steps', 'The robot is broken'],
    correctIndex: 0,
    hints: ['Compare what it SHOULD do with what it DOES.', 'The turn right happened too early!'],
    explanation: 'Steps 2 and 3 are swapped! Debugging means finding and fixing mistakes in instructions.',
    xpAward: 25,
    skill: 'Problem-Solving Steps'
  },
  {
    id: 'g4_r3',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Robot Movements ➡️',
    question: 'A robot faces NORTH. It turns right. Which direction does it face now?',
    options: ['South', 'East', 'West', 'North'],
    correctIndex: 1,
    hints: ['Imagine you are facing forward (North). Turn right...', 'Right from North is East!'],
    explanation: 'Perfect! Facing North and turning right = now facing East!',
    xpAward: 25,
    skill: 'Robot Movements'
  },
  {
    id: 'g4_r4',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Movement Commands 🏃',
    question: 'How many squares does the robot move? Instructions: Forward 2, Forward 3.',
    options: ['2 squares', '3 squares', '5 squares', '6 squares'],
    correctIndex: 2,
    hints: ['Add the two forward commands together.', '2 + 3 = ?'],
    explanation: 'The robot moves 5 squares total (2 + 3 = 5). Sequential commands add up!',
    xpAward: 25,
    skill: 'Robot Movements'
  },
  {
    id: 'g4_r5',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Sensors 📡',
    question: 'A robot has a light sensor. What can it detect?',
    options: ['Sound', 'Temperature', 'Brightness (light or dark)', 'Smell'],
    correctIndex: 2,
    hints: ['A LIGHT sensor detects... light!', 'It can tell if something is bright or dark.'],
    explanation: 'A light sensor detects brightness — whether it is light or dark around the robot!',
    xpAward: 25,
    skill: 'Sensors & Actions'
  },
  {
    id: 'g4_r6',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Sensor Actions 🚦',
    question: 'A robot is programmed: "IF obstacle detected THEN stop." What happens when it reaches a wall?',
    options: ['It keeps going', 'It stops', 'It turns around', 'It jumps'],
    correctIndex: 1,
    hints: ['The wall is an obstacle!', 'The rule says IF obstacle → stop.'],
    explanation: 'The robot stops! The sensor detects the wall (obstacle) and follows the IF rule.',
    xpAward: 25,
    skill: 'Sensors & Actions'
  },
  {
    id: 'g4_r7',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Loops with Robots 🔁',
    question: 'What does this do? "Repeat 4 times: Move Forward 1, Turn Right"',
    options: ['Goes in a straight line', 'Makes a square shape', 'Spins in a circle', 'Goes backwards'],
    correctIndex: 1,
    hints: ['Move forward then turn right, 4 times...', 'A square has 4 sides and 4 right-angle turns!'],
    explanation: 'It draws a square! Forward + right turn, repeated 4 times = a square path!',
    xpAward: 30,
    skill: 'Loops & Patterns'
  },
  {
    id: 'g4_r8',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Conditions (If-Then) ☂️',
    question: 'IF it is raining THEN take an umbrella. It is sunny today. What do you do?',
    options: ['Take an umbrella', 'Nothing — the condition is not met', 'Stay inside', 'Wear a raincoat'],
    correctIndex: 1,
    hints: ['The rule only activates IF it is raining.', 'It is sunny — so the IF condition is false!'],
    explanation: 'Since it is NOT raining, the condition is false and you skip the umbrella instruction!',
    xpAward: 25,
    skill: 'Conditions & Logic'
  },
  {
    id: 'g3_r7',
    gradeLevel: 3,
    subject: 'robotics',
    title: 'Everyday Algorithms 📋',
    question: 'Which of these is the BEST algorithm for making a sandwich?',
    options: ['Eat, spread, bread', 'Bread, spread, filling, close, eat', 'Filling, bread, eat, spread', 'Close, bread, eat'],
    correctIndex: 1,
    hints: ['Think about the order you would really do it!', 'First get bread, then spread, add filling, close it, then eat!'],
    explanation: 'Perfect order! Bread → spread → filling → close → eat. That\'s a clear algorithm!',
    xpAward: 20,
    skill: 'Algorithms & Sequences'
  },
  {
    id: 'g4_r9',
    gradeLevel: 4,
    subject: 'robotics',
    title: 'Decomposition 🧩',
    question: 'Breaking a big problem into smaller parts is called...',
    options: ['Looping', 'Decomposition', 'Debugging', 'Sequencing'],
    correctIndex: 1,
    hints: ['De-compose means to break apart.', 'Splitting a big task into smaller tasks!'],
    explanation: 'Decomposition means breaking a complex problem into smaller, manageable pieces!',
    xpAward: 25,
    skill: 'Problem-Solving Steps'
  },

  // --- VIBING (Coding / Vibe Coding for Kids) ---
  {
    id: 'g3_v1',
    gradeLevel: 3,
    subject: 'vibing',
    title: 'What is Code? 💻',
    question: 'What is code?',
    options: ['A secret language only grown-ups know', 'Instructions that tell a computer what to do', 'A type of puzzle game', 'A special kind of maths'],
    correctIndex: 1,
    hints: ['Think about how you give instructions to a friend.', 'Code is like a recipe — step-by-step instructions for a computer!'],
    explanation: 'Code is a set of instructions that tells a computer exactly what to do, step by step — like giving directions!',
    xpAward: 15,
    skill: 'What is Code'
  },
  {
    id: 'g3_v2',
    gradeLevel: 3,
    subject: 'vibing',
    title: 'Variables — Labelled Boxes 📦',
    question: 'A variable is like a...',
    options: ['A locked safe', 'A labelled box that holds a value', 'A broken calculator', 'A type of loop'],
    correctIndex: 1,
    hints: ['Imagine a box with a name on it.', 'You can put things inside and change them later!'],
    explanation: 'A variable is like a labelled box — it has a name and holds a value inside (like myAge = 8)!',
    xpAward: 15,
    skill: 'Variables'
  },
  {
    id: 'g3_v3',
    gradeLevel: 3,
    subject: 'vibing',
    title: 'Loops — Repeating Steps 🔁',
    question: 'What does a loop do in code?',
    options: ['Stops the program', 'Repeats steps a set number of times', 'Deletes everything', 'Makes the computer faster'],
    correctIndex: 1,
    hints: ['Think about doing jumping jacks: "do this 10 times".', 'A loop saves you from writing the same thing over and over!'],
    explanation: 'A loop repeats a set of instructions — instead of writing "jump" 10 times, you say "repeat 10 times: jump"!',
    xpAward: 15,
    skill: 'Loops'
  },
  {
    id: 'g3_v4',
    gradeLevel: 3,
    subject: 'vibing',
    title: 'Conditionals — Making Choices ❓',
    question: 'IF it is cold outside THEN wear a jacket. What is this an example of?',
    options: ['A loop', 'A variable', 'A conditional (if-then choice)', 'A function'],
    correctIndex: 2,
    hints: ['The code checks something and then decides what to do.', 'IF something is true THEN do this — that\'s a conditional!'],
    explanation: 'A conditional is a decision in code: IF something is true THEN do an action. It\'s how code makes choices!',
    xpAward: 15,
    skill: 'Conditionals'
  },
  {
    id: 'g4_v5',
    gradeLevel: 4,
    subject: 'vibing',
    title: 'Functions — Reusable Recipes 🧑‍🍳',
    question: 'A function in coding is like...',
    options: ['A one-time action', 'A reusable recipe you can call by name', 'A random event', 'A type of variable'],
    correctIndex: 1,
    hints: ['Think of a recipe: you write it once but use it many times.', 'A function has a name, and when you "call" it, it runs all its steps!'],
    explanation: 'A function is a named set of instructions you write once and reuse whenever you need it — like a recipe you can call by name!',
    xpAward: 20,
    skill: 'Functions'
  },
  {
    id: 'g4_v6',
    gradeLevel: 4,
    subject: 'vibing',
    title: 'Building a Project Plan 📋',
    question: 'What should you do FIRST when building a coding project?',
    options: ['Start typing code immediately', 'Plan what you want to build and break it into steps', 'Ask someone else to do it', 'Pick the hardest part and start there'],
    correctIndex: 1,
    hints: ['Before building a house, you need a blueprint!', 'Planning means deciding: what will it do? What steps do I need?'],
    explanation: 'Always plan first! Break your project into small steps (milestones), then tackle them one by one. Great coders plan before they build!',
    xpAward: 20,
    skill: 'Project Planning'
  },
];

// --- 6 WEEKS ROTATIONAL STORY BANK (12 STORIES TOTAL) ---
export const STORIES_BANK: ReadingStory[] = [
  // WEEK 1
  {
    id: 'w1_s1',
    weekNumber: 1,
    storyNumber: 1,
    title: 'The Secret of Table Mountain 🏔️',
    emoji: '🏔️',
    readingTimeMinutes: 3,
    content: [
      'Once upon a time in Cape Town, a curious explorer named Lindiwe found an ancient shiny compass in her grandfather\'s wooden chest.',
      'The compass had a glowing blue needle that pointed towards Table Mountain. "Let\'s follow the magical trail!" whispered her fluffy dog, Barnaby.',
      'As they walked up the winding path through the protea flowers, they met a wise little dassie sitting on a warm rock. The dassie smiled and said, "To unlock the mountain\'s treasure, you must solve three riddles of kindness!"',
      'Lindiwe shared her apple with a thirsty sunbird, helped Barnaby leap across a small stream, and said "Thank you" to the mountain breeze.',
      'Suddenly, the clouds parted, revealing a rainbow cave filled with glowing crystals and a golden badge that read: Master Explorer of Kindness!'
    ],
    quizQuestions: [
      {
        question: 'What shiny item did Lindiwe find in her grandfather\'s chest?',
        options: ['A golden key', 'An ancient shiny compass', 'A silver coin', 'A magnifying glass'],
        correctIndex: 1,
        explanation: 'Lindiwe found an ancient shiny compass with a glowing blue needle!'
      },
      {
        question: 'Who accompanied Lindiwe on her adventure?',
        options: ['Her fluffy dog, Barnaby', 'Her cousin Thabo', 'A baby eagle', 'Her school teacher'],
        correctIndex: 0,
        explanation: 'Her faithful fluffy dog Barnaby went along on the adventure!'
      }
    ]
  },
  {
    id: 'w1_s2',
    weekNumber: 1,
    storyNumber: 2,
    title: 'The Glowing Firefly of Kruger 💡',
    emoji: '💡',
    readingTimeMinutes: 3,
    content: [
      'Under the starry night sky of Kruger National Park, a small firefly named Sparky wanted to light up the acacia trees.',
      'While flying over the riverbank, Sparky saw a lost little chameleon who could not find his way home in the dark.',
      'Sparky zipped into the air and flashed a bright golden pattern. "Follow my light!" called Sparky gently.',
      'Together, they guided the chameleon safely back to his family branch. The stars twinkled warmly as Sparky earned his Star Guide Badge!'
    ],
    quizQuestions: [
      {
        question: 'What kind of animal was lost in the dark?',
        options: ['A little chameleon', 'A baby lion', 'A giraffe', 'A zebra'],
        correctIndex: 0,
        explanation: 'Sparky helped a lost little chameleon find his way home!'
      }
    ]
  },

  // WEEK 2
  {
    id: 'w2_s1',
    weekNumber: 2,
    storyNumber: 1,
    title: 'Thabo & The Talking Baobab Tree 🌳',
    emoji: '🌳',
    readingTimeMinutes: 3,
    content: [
      'High on a grassy hill in Limpopo stood a giant ancient Baobab tree with wide roots.',
      'Thabo sat under its shade while doing his Grade 4 maths homework. "How can I divide 84 by 4?" he wondered out loud.',
      'Rustle, rustle! The Baobab tree whispered softly, "Divide the tens first, young explorer! 8 tens divided by 4 gives you 2 tens!"',
      'Thabo smiled, "And 4 ones divided by 4 gives me 1 one! Total is 21!" The Baobab rustled happily in approval.'
    ],
    quizQuestions: [
      {
        question: 'What sum was Thabo solving under the tree?',
        options: ['84 ÷ 4', '50 - 20', '10 × 10', '100 + 50'],
        correctIndex: 0,
        explanation: 'Thabo solved 84 ÷ 4 = 21 with help from the Baobab tree!'
      }
    ]
  },
  {
    id: 'w2_s2',
    weekNumber: 2,
    storyNumber: 2,
    title: 'The Little Dassie\'s Great Leap 🦘',
    emoji: '🦘',
    readingTimeMinutes: 3,
    content: [
      'Pip the Dassie lived on a rocky boulder near the sea. All his friends were great leapers, but Pip was afraid of falling.',
      'His mother encouraged him: "Take one small step first, Pip! Big leaps start with brave little steps."',
      'Pip closed his eyes, took a deep breath, and hopped onto the nearest stone. He did it! He cheered and danced in the sunshine.'
    ],
    quizQuestions: [
      {
        question: 'What advice did Pip\'s mother give him?',
        options: ['Take one small step first', 'Stay on the rock forever', 'Run fast', 'Fly high'],
        correctIndex: 0,
        explanation: 'His mother reminded him that big leaps start with brave little steps!'
      }
    ]
  },

  // WEEK 3
  {
    id: 'w3_s1',
    weekNumber: 3,
    storyNumber: 1,
    title: 'The Whispering Waves of Hermanus 🐋',
    emoji: '🐋',
    readingTimeMinutes: 3,
    content: [
      'Standing near the coastal cliffs of Hermanus, Zola listened to the booming sound of southern right whales splashing in the ocean.',
      'A majestic mother whale breached out of the blue water and splashed her giant tail. Splash!',
      'Zola wrote a poem in her English notebook describing the ocean waves as gentle blue giants dancing under the sun.'
    ],
    quizQuestions: [
      {
        question: 'Which sea animal did Zola watch near the cliffs?',
        options: ['Southern right whales', 'Dolphins', 'Sea turtles', 'Penguins'],
        correctIndex: 0,
        explanation: 'Zola watched the southern right whales in Hermanus!'
      }
    ]
  },
  {
    id: 'w3_s2',
    weekNumber: 3,
    storyNumber: 2,
    title: 'Lindiwe\'s Solar Rocket 🚀',
    emoji: '🚀',
    readingTimeMinutes: 3,
    content: [
      'Lindiwe built a miniature rocket model powered by a small solar panel for her Grade 4 science project.',
      'When the bright afternoon sun hit the panel, the solar propeller spun rapidly, sending the rocket buzzing across the yard.',
      'Her class clapped enthusiastically as she demonstrated renewable solar energy in action!'
    ],
    quizQuestions: [
      {
        question: 'What energy source powered Lindiwe\'s rocket model?',
        options: ['Solar energy (sunlight)', 'Batteries', 'Wind power', 'Gasoline'],
        correctIndex: 0,
        explanation: 'Lindiwe used clean solar energy from the sun!'
      }
    ]
  },

  // WEEK 4
  {
    id: 'w4_s1',
    weekNumber: 4,
    storyNumber: 1,
    title: 'The Golden Sunbird of Drakensberg 🦅',
    emoji: '🦅',
    readingTimeMinutes: 3,
    content: [
      'High in the misty peaks of the Drakensberg mountains, a tiny sunbird with golden feathers built a nest woven with wild grass.',
      'Whenever rain fell, the sunbird tucked its young under warm wings and sang a song of patience until the sun returned.'
    ],
    quizQuestions: [
      {
        question: 'Where did the golden sunbird build its nest?',
        options: ['In the Drakensberg mountains', 'On a beach boat', 'Inside a barn', 'In a city park'],
        correctIndex: 0,
        explanation: 'The sunbird lived in the Drakensberg mountains!'
      }
    ]
  },
  {
    id: 'w4_s2',
    weekNumber: 4,
    storyNumber: 2,
    title: 'The Mystery of the Missing Protea 🌸',
    emoji: '🌸',
    readingTimeMinutes: 3,
    content: [
      'The garden keeper noticed a rare pink King Protea flower was missing from the botanical path.',
      'Explorer Sipho followed tiny paw prints in the soil that led directly to a happy family of tortoises sharing flower petals!'
    ],
    quizQuestions: [
      {
        question: 'Who took the protea petals in the garden?',
        options: ['A family of tortoises', 'A cheeky monkey', 'A garden bird', 'A rabbit'],
        correctIndex: 0,
        explanation: 'Sipho followed paw prints to a family of tortoises!'
      }
    ]
  },

  // WEEK 5
  {
    id: 'w5_s1',
    weekNumber: 5,
    storyNumber: 1,
    title: 'Bokkie\'s Great Marathon 🦌',
    emoji: '🦌',
    readingTimeMinutes: 3,
    content: [
      'Bokkie the springbok loved running across the Karoo plains. During the annual forest fun run, he stopped to help a small tortoise who had flipped over on the track.',
      'Though Bokkie didn\'t cross the finish line first, he won the Gold Sportsmanship Trophy!'
    ],
    quizQuestions: [
      {
        question: 'Why did Bokkie stop running during the race?',
        options: ['To help a flipped tortoise', 'To take a nap', 'To eat grass', 'Because he got lost'],
        correctIndex: 0,
        explanation: 'Bokkie paused to help a friend in need!'
      }
    ]
  },
  {
    id: 'w5_s2',
    weekNumber: 5,
    storyNumber: 2,
    title: 'The Rainbow Star over Soweto 🌈',
    emoji: '🌈',
    readingTimeMinutes: 3,
    content: [
      'On a crisp winter evening in Soweto, children gathered around a warm community campfire to share traditional stories and music under a starry sky.'
    ],
    quizQuestions: [
      {
        question: 'What did the children share around the campfire?',
        options: ['Traditional stories and music', 'Computer games', 'Maths tests', 'Silent reading'],
        correctIndex: 0,
        explanation: 'They gathered around the campfire to share stories and songs!'
      }
    ]
  },

  // WEEK 6
  {
    id: 'w6_s1',
    weekNumber: 6,
    storyNumber: 1,
    title: 'The Brave Meerkat Family 🦦',
    emoji: '🦦',
    readingTimeMinutes: 3,
    content: [
      'In the Kalahari Desert, a sentry meerkat stood tall on two hind legs to watch for hawks while his brothers and sisters dug for roots.',
      'Teamwork kept the meerkat family safe, fed, and happy every single day.'
    ],
    quizQuestions: [
      {
        question: 'Why did the sentry meerkat stand tall on its hind legs?',
        options: ['To watch out for hawks and keep family safe', 'To look for water', 'To dance', 'To sleep'],
        correctIndex: 0,
        explanation: 'The sentry stood watch to protect the meerkat family!'
      }
    ]
  },
  {
    id: 'w6_s2',
    weekNumber: 6,
    storyNumber: 2,
    title: 'The Compass of Kindness 🧭',
    emoji: '🧭',
    readingTimeMinutes: 3,
    content: [
      'At the end of the school term, Lindiwe looked back at all her XP badges and learning journals.',
      'She realized the greatest compass she possessed was her kind heart and curiosity to learn new things every day!'
    ],
    quizQuestions: [
      {
        question: 'What was Lindiwe\'s greatest compass?',
        options: ['Her kind heart and curiosity', 'A metal toy', 'A computer screen', 'A paper map'],
        correctIndex: 0,
        explanation: 'Her kind heart and love for learning was her ultimate compass!'
      }
    ]
  }
];
