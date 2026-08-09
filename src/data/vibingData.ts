export interface VibingLesson {
  id: string;
  term: number;
  week: number;
  title: string;
  objective: string;
  concepts: string[];
  activity: string;
  challengePrompt: string;
  xpReward: number;
}

export interface VibingProject {
  id: string;
  term: number;
  title: string;
  description: string;
  milestones: { week: number; title: string; deliverable: string }[];
  finalDeliverable: string;
}

export interface VibingMilestone {
  week: number;
  title: string;
  description: string;
  activity: string; // what to do this week
  concepts: string[]; // coding concepts introduced
  parentUpdate: string; // what parents see as progress
  xpReward: number;
  isCompleted: boolean;
}

export interface VibingTermProject {
  id: string;
  term: number;
  title: string;
  description: string;
  finalGoal: string;
  weeklyMilestones: VibingMilestone[];
}

export const VIBING_LESSONS: VibingLesson[] = [
  // TERM 1 — Introduction to Code Thinking
  { id: 'v1_w1', term: 1, week: 1, title: 'What is Code?', objective: 'Understand that code is instructions that tell computers what to do.', concepts: ['instructions', 'sequence', 'computers follow rules'], activity: 'Write step-by-step instructions to make a peanut butter sandwich. Read them out loud exactly as written — did it work?', challengePrompt: 'Ask the AI: "Explain what code is to an 8-year-old using the example of giving directions to a friend who is blindfolded."', xpReward: 15 },
  { id: 'v1_w2', term: 1, week: 2, title: 'Giving Clear Instructions', objective: 'Learn that computers need exact, clear instructions.', concepts: ['precision', 'order matters', 'no assumptions'], activity: 'Play "Robot Teacher": one person is the robot, the other gives step-by-step instructions to draw a house. The robot does ONLY what is said!', challengePrompt: 'Ask the AI: "Be my robot. I will give you instructions to draw a cat. Only do exactly what I say, step by step."', xpReward: 15 },
  { id: 'v1_w3', term: 1, week: 3, title: 'Variables — Boxes That Hold Things', objective: 'Understand that a variable stores a value, like a labelled box.', concepts: ['variable', 'value', 'naming'], activity: 'Get 3 boxes or cups. Label them "myName", "myAge", "favouriteColour". Put a card inside each with the answer. Change the card — the variable updates!', challengePrompt: 'Ask the AI: "Let\'s play a game. I\'ll create variables and you remember them. myPet = dog, myAge = 8. Now what is myPet?"', xpReward: 15 },
  { id: 'v1_w4', term: 1, week: 4, title: 'Naming Things Well', objective: 'Learn why good names help us understand code.', concepts: ['descriptive names', 'clarity', 'labels'], activity: 'Rename items in your room with silly vs sensible names. Which is easier to find: "thing1" or "blueWaterBottle"?', challengePrompt: 'Ask the AI: "I have a variable called x. It holds the number of apples I have. What would be a better name for it and why?"', xpReward: 15 },
  { id: 'v1_w5', term: 1, week: 5, title: 'Conditions — If This, Then That', objective: 'Learn that code can make decisions using conditions.', concepts: ['if-then', 'conditions', 'decisions'], activity: 'Play "If-Then Simon Says": IF I clap THEN you jump. IF I stomp THEN you spin. Add more rules!', challengePrompt: 'Ask the AI: "Let\'s create a story where the hero makes 3 if-then decisions. I pick what happens at each choice."', xpReward: 15 },
  { id: 'v1_w6', term: 1, week: 6, title: 'True or False', objective: 'Understand that conditions check if something is true or false.', concepts: ['boolean', 'true/false', 'comparison'], activity: 'Quiz game: Say statements and decide TRUE or FALSE. "The sky is green" → FALSE. "8 is bigger than 3" → TRUE.', challengePrompt: 'Ask the AI: "Give me 10 true/false questions about animals. After I answer, tell me my score and explain any I got wrong."', xpReward: 15 },
  { id: 'v1_w7', term: 1, week: 7, title: 'Loops — Repeat After Me', objective: 'Learn that loops repeat actions without writing them many times.', concepts: ['loop', 'repeat', 'efficiency'], activity: 'Dance challenge: "Repeat 4 times: step left, clap, step right, clap." Then try "Repeat 3 times: jump, spin."', challengePrompt: 'Ask the AI: "Help me write a loop that draws a pattern. I want to repeat: draw a star, move right — 5 times."', xpReward: 15 },
  { id: 'v1_w8', term: 1, week: 8, title: 'Patterns Are Everywhere', objective: 'Spot patterns in daily life and see how loops create them.', concepts: ['patterns', 'repetition', 'prediction'], activity: 'Find 5 patterns at home or outside (tiles, fences, music beats). Draw them and write the "loop" that creates each one.', challengePrompt: 'Ask the AI: "I see a pattern: 🔴🔵🔴🔵. Write it as a loop. Now help me make a harder pattern with 3 things repeating."', xpReward: 15 },
  { id: 'v1_w9', term: 1, week: 9, title: 'Functions — Recipes for Code', objective: 'Understand that a function is a reusable set of instructions with a name.', concepts: ['function', 'reusable', 'name and call'], activity: 'Write a "recipe function" called makeToast(). It has steps inside. Now "call" it 3 times — you don\'t rewrite the steps!', challengePrompt: 'Ask the AI: "Let\'s make a function called greet(name). It should say Hello and the name. Then call it with my name and my friend\'s name."', xpReward: 15 },
  { id: 'v1_w10', term: 1, week: 10, title: 'Building Blocks — Putting It Together', objective: 'Combine sequences, variables, conditions, loops, and functions.', concepts: ['combining concepts', 'building', 'mini-program'], activity: 'Design a "Morning Routine Program" on paper using all the concepts: variables (myName), a loop (brush teeth 30 times), a condition (if raining → take umbrella), a function (getReady).', challengePrompt: 'Ask the AI: "Help me design a simple text adventure game. The player has a name (variable), makes choices (if-then), and some actions repeat (loops)."', xpReward: 20 },

  // TERM 2 — Building With Blocks
  { id: 'v2_w1', term: 2, week: 1, title: 'Recap & Level Up', objective: 'Review Term 1 concepts and get ready for bigger projects.', concepts: ['review', 'sequences', 'variables', 'conditions', 'loops', 'functions'], activity: 'Create a "Coding Concepts" poster with drawings for each concept you learned. Teach it to someone at home!', challengePrompt: 'Ask the AI: "Quiz me on coding concepts: sequences, variables, conditions, loops, and functions. Give me fun questions!"', xpReward: 15 },
  { id: 'v2_w2', term: 2, week: 2, title: 'Events — When Something Happens', objective: 'Learn that programs can respond when things happen (clicks, taps, sounds).', concepts: ['events', 'triggers', 'when-do'], activity: 'Create an "event board" at home: WHEN doorbell rings → answer door. WHEN timer beeps → food is ready. Find 5 events!', challengePrompt: 'Ask the AI: "Help me design a game where WHEN I say a magic word, something happens. I want 3 different events and actions."', xpReward: 15 },
  { id: 'v2_w3', term: 2, week: 3, title: 'Lists — Collecting Things', objective: 'Learn that lists store many items in order.', concepts: ['list', 'array', 'items in order'], activity: 'Make a shopping list, a playlist, and a "top 5 animals" list. Practice adding and removing items. What position is each item?', challengePrompt: 'Ask the AI: "I have a list of my favourite foods. Help me add items, remove one, and find what\'s at position 3."', xpReward: 15 },
  { id: 'v2_w4', term: 2, week: 4, title: 'Counting & Keeping Score', objective: 'Use variables to count things and keep track of scores.', concepts: ['counter', 'increment', 'score tracking'], activity: 'Play a bean bag toss game. Keep score with a variable: score = 0. Each hit: score = score + 1. Who wins?', challengePrompt: 'Ask the AI: "Let\'s make a points game. Start with score = 0. I\'ll tell you when I score and you update my total."', xpReward: 15 },
  { id: 'v2_w5', term: 2, week: 5, title: 'Input & Output', objective: 'Programs take input from users and show output.', concepts: ['input', 'output', 'interaction'], activity: 'Design a "question machine" on paper: it asks your name (input) and says "Hello, [name]! You are awesome!" (output).', challengePrompt: 'Ask the AI: "Be a question machine. Ask me 3 questions, then use my answers to write a funny story about me."', xpReward: 15 },
  { id: 'v2_w6', term: 2, week: 6, title: 'Random & Surprise', objective: 'Learn that programs can pick random values for games and fun.', concepts: ['random', 'chance', 'unpredictable'], activity: 'Make a "random picker" with numbered cards in a bag. Pick one without looking! Use it to decide snacks or activities.', challengePrompt: 'Ask the AI: "Generate a random adventure for me. Pick a random animal, place, and challenge. Make it a fun mini-story!"', xpReward: 15 },
  { id: 'v2_w7', term: 2, week: 7, title: 'Nested Conditions', objective: 'Use conditions inside other conditions for more complex decisions.', concepts: ['nested if', 'multiple conditions', 'and/or'], activity: 'Weather dress-up game: IF cold AND rainy → jacket + umbrella. IF cold AND sunny → jacket only. IF warm → t-shirt!', challengePrompt: 'Ask the AI: "Help me build a pet care guide using nested conditions: IF pet is hungry AND it\'s morning THEN give breakfast."', xpReward: 15 },
  { id: 'v2_w8', term: 2, week: 8, title: 'Planning Before Coding', objective: 'Learn to plan and sketch before writing code (pseudocode).', concepts: ['planning', 'pseudocode', 'flowchart'], activity: 'Draw a flowchart for "What should I do after school?" with yes/no diamond decisions and action boxes.', challengePrompt: 'Ask the AI: "Help me plan a simple app that reminds me to drink water. Let\'s write the steps in plain English first."', xpReward: 15 },
  { id: 'v2_w9', term: 2, week: 9, title: 'Testing & Fixing', objective: 'Learn to test your programs and fix bugs.', concepts: ['testing', 'debugging', 'fixing'], activity: 'Write instructions for a blindfolded maze walk. Have someone follow them. When they bump into something, that\'s a bug — fix it!', challengePrompt: 'Ask the AI: "I wrote these steps to make a smoothie but something is wrong: 1. Blend 2. Pour in cup 3. Add fruit 4. Add milk. Help me find the bug!"', xpReward: 15 },
  { id: 'v2_w10', term: 2, week: 10, title: 'My First Creation', objective: 'Combine everything to create a simple interactive story or game.', concepts: ['project', 'combining', 'creativity'], activity: 'Design a "Choose Your Own Adventure" story on paper with at least 2 choices, a loop (going back), and a score variable.', challengePrompt: 'Ask the AI: "Help me create a choose-your-own-adventure story with 3 choices, a score counter, and a surprise ending."', xpReward: 25 },

  // TERM 3 — Foundations & Building Blocks (accelerated: Terms 1+2 combined)
  { id: 'v3_w1', term: 3, week: 1, title: 'What is Code?', objective: 'Understand that code is instructions for computers, and practise giving clear step-by-step instructions.', concepts: ['instructions', 'sequence', 'precision', 'computers follow rules'], activity: 'Write step-by-step instructions to make a peanut butter sandwich AND to brush your teeth. Read them out to someone — they must do ONLY what you say!', challengePrompt: 'Ask the AI: "Be my robot. I will give you instructions to draw a house. Only do EXACTLY what I say, nothing more."', xpReward: 15 },
  { id: 'v3_w2', term: 3, week: 2, title: 'Variables & Naming', objective: 'Learn that variables are labelled boxes holding information, and that good names make code clear.', concepts: ['variable', 'value', 'naming', 'descriptive names'], activity: 'Label 5 cups/boxes with variable names: myName, myAge, favouriteAnimal, todayWeather, bestFriend. Put cards inside. Change one — the variable updated!', challengePrompt: 'Ask the AI: "Let\'s play a variable game. I\'ll create 5 variables, you remember them. Then I\'ll change some and you tell me the new values."', xpReward: 15 },
  { id: 'v3_w3', term: 3, week: 3, title: 'Conditions & True/False', objective: 'Learn if-then logic and that conditions check whether something is true or false.', concepts: ['if-then', 'conditions', 'boolean', 'true/false', 'decisions'], activity: 'Play "If-Then Simon Says" with at least 6 rules. Then play a TRUE/FALSE quiz game with 10 statements. Track your score!', challengePrompt: 'Ask the AI: "Create a choose-your-own-adventure with 3 if-then choices. I decide what happens at each branch!"', xpReward: 15 },
  { id: 'v3_w4', term: 3, week: 4, title: 'Loops & Patterns', objective: 'Understand that loops repeat actions and create patterns efficiently.', concepts: ['loop', 'repeat', 'patterns', 'efficiency'], activity: 'Dance loop: "Repeat 4 times: jump, clap, spin." Then find 5 patterns around your home and write the loop that creates each one.', challengePrompt: 'Ask the AI: "I see a pattern: 🔴🔵🟡🔴🔵🟡. Write it as a loop. Now help me make a pattern with 4 things repeating 3 times."', xpReward: 15 },
  { id: 'v3_w5', term: 3, week: 5, title: 'Functions & Events', objective: 'Learn reusable functions (named recipes) and events (when-something-happens triggers).', concepts: ['function', 'reusable', 'events', 'triggers', 'when-do'], activity: 'Write a function makeBreakfast() with steps inside. "Call" it 3 times without rewriting! Then list 5 events at home: WHEN doorbell → answer, WHEN alarm → wake up.', challengePrompt: 'Ask the AI: "Let\'s make a function called singHappyBirthday(name). It sings to whoever I call it with! Then trigger it with an event."', xpReward: 15 },
  { id: 'v3_w6', term: 3, week: 6, title: 'Lists, Scores & Data', objective: 'Use lists to collect items and variables to keep score.', concepts: ['list', 'array', 'counter', 'score', 'data'], activity: 'Make a "Top 10 Favourite Things" list. Play a bean bag toss and keep score: score = 0, each hit adds 1. Who has the highest score?', challengePrompt: 'Ask the AI: "I have a list of SA animals. Help me sort them by size, find the 3rd one, remove one, and count how many are left."', xpReward: 15 },
  { id: 'v3_w7', term: 3, week: 7, title: 'Input, Output & Interaction', objective: 'Programs take input from users and show output back — this is how apps talk to people.', concepts: ['input', 'output', 'interaction', 'messages', 'feedback'], activity: 'Design a "question machine" on paper: asks 3 questions (inputs), then uses the answers (outputs) to write a personalised poem or story about YOU.', challengePrompt: 'Ask the AI: "Be a question machine. Ask me 5 things about myself, then use my answers to write a short story starring me!"', xpReward: 15 },
  { id: 'v3_w8', term: 3, week: 8, title: 'Planning & Pseudocode', objective: 'Learn to plan before building — draw flowcharts and write pseudocode.', concepts: ['planning', 'pseudocode', 'flowchart', 'thinking ahead'], activity: 'Draw a flowchart for "What should I wear today?" with yes/no diamonds. Then write pseudocode for a morning routine with conditions and loops.', challengePrompt: 'Ask the AI: "Help me plan a simple app that reminds me to drink water. Let\'s write the steps in plain English first, then draw a flowchart."', xpReward: 15 },
  { id: 'v3_w9', term: 3, week: 9, title: 'Testing & Debugging', objective: 'Test your programs, find bugs, and fix them — mistakes are how we learn!', concepts: ['testing', 'debugging', 'fixing', 'iteration'], activity: 'Write wrong sandwich instructions on purpose. Give them to someone — they will find the bugs! Also: play "spot the bug" in 5 broken instruction sets.', challengePrompt: 'Ask the AI: "I wrote these steps to make tea but they are wrong: 1. Drink tea 2. Boil water 3. Add teabag 4. Pour water. Help me find and fix ALL the bugs!"', xpReward: 15 },
  { id: 'v3_w10', term: 3, week: 10, title: 'My First Mini-Project', objective: 'Combine EVERYTHING into one creation — you are now a coder!', concepts: ['combining', 'project', 'all concepts together', 'creativity'], activity: 'Design a paper "app" that uses: variables (player name), conditions (if-then choices), loops (repeating sections), functions (reusable actions), lists (inventory), and events (button presses). Present it!', challengePrompt: 'Ask the AI: "Help me design a simple text adventure game on paper. It needs a name variable, 3 if-then choices, a loop, a score counter, and an ending. Let\'s build it step by step!"', xpReward: 25 },

  // TERM 4 — Creating With AI & Building Real Things
  { id: 'v4_w1', term: 4, week: 1, title: 'What is AI?', objective: 'Understand what AI is, how it helps us, and how to talk to it effectively.', concepts: ['artificial intelligence', 'prompts', 'clear questions'], activity: 'List 5 AI things at home (autocorrect, voice assistants, recommendations). Then ask the same question 3 ways — vague, better, best — and compare the AI responses.', challengePrompt: 'Ask the AI: "Explain what you are and how you work, like I\'m 8 years old. Then teach me 3 tips for asking you better questions."', xpReward: 15 },
  { id: 'v4_w2', term: 4, week: 2, title: 'AI as a Creative Partner', objective: 'Use AI to brainstorm, co-create stories, and build characters.', concepts: ['collaboration', 'co-creation', 'character design', 'prompting'], activity: 'Create a character card (name, superpower, weakness, catchphrase). Then co-write a short story with AI: you write 1 paragraph, AI writes the next, take turns!', challengePrompt: 'Ask the AI: "Let\'s create a character together. Ask me 5 questions about them, then describe them back to me in an exciting way!"', xpReward: 15 },
  { id: 'v4_w3', term: 4, week: 3, title: 'Building an Interactive Story', objective: 'Design a story with choices, branches, and multiple endings.', concepts: ['interactive stories', 'branching', 'user choices', 'story structure'], activity: 'Draw a story map with START, at least 2 choice points (diamonds), 3 different endings, and arrows showing every path. Make sure every path reaches an ending!', challengePrompt: 'Ask the AI: "Help me build an interactive story about a lost treasure in Table Mountain. It needs 2 choice points and 3 possible endings. Let\'s plan the map first."', xpReward: 15 },
  { id: 'v4_w4', term: 4, week: 4, title: 'Building With AI Help', objective: 'Use AI step-by-step to build a quiz game with scoring and feedback.', concepts: ['iterative building', 'AI assistance', 'step-by-step creation'], activity: 'Ask AI to help you build a 5-question quiz: first the questions, then scoring, then feedback messages, then a title screen. Build it piece by piece!', challengePrompt: 'Ask the AI: "Help me build a quiz about South African animals. Step 1: give me 5 questions with answers. Step 2: add scoring. Step 3: add funny feedback for right and wrong answers."', xpReward: 20 },
  { id: 'v4_w5', term: 4, week: 5, title: 'Solving Real Problems', objective: 'Identify a real problem and design an app solution.', concepts: ['problem identification', 'empathy', 'solution design'], activity: 'Walk around home and school. Write down 5 problems you notice. Pick the BEST one and draw how an app could fix it. Interview someone who has the problem!', challengePrompt: 'Ask the AI: "I noticed that my mom always forgets her keys. Help me brainstorm 3 different app ideas that could solve this problem."', xpReward: 15 },
  { id: 'v4_w6', term: 4, week: 6, title: 'Wireframing My App', objective: 'Draw screen plans for a real app idea.', concepts: ['wireframing', 'screens', 'navigation', 'user interface'], activity: 'Draw 4 screens for your problem-solving app: splash screen, main screen, action screen, success screen. Show buttons and arrows for navigation.', challengePrompt: 'Ask the AI: "I\'m designing a [describe your app]. Help me plan what should be on each of my 4 screens — what text, buttons, and pictures."', xpReward: 15 },
  { id: 'v4_w7', term: 4, week: 7, title: 'Writing the Logic', objective: 'Write pseudocode and rules for how the app works.', concepts: ['pseudocode', 'app logic', 'rules', 'conditions'], activity: 'Write the IF-THEN rules for your app. What happens when each button is pressed? Write the step-by-step instructions for the main feature. Draw a flowchart!', challengePrompt: 'Ask the AI: "Here is my app idea: [describe]. Help me write the logic as simple IF-THEN rules and numbered steps that a computer could follow."', xpReward: 15 },
  { id: 'v4_w8', term: 4, week: 8, title: 'Design & Style', objective: 'Create a style guide — colours, fonts, icons — that makes the app inviting.', concepts: ['visual design', 'colour theory', 'style guide', 'user experience'], activity: 'Pick 3 colours for your app, design the app icon, choose button styles, and redraw your favourite screen with full colours and style. Make it look REAL!', challengePrompt: 'Ask the AI: "Help me choose a colour scheme for an app that [does what yours does]. Suggest 3 main colours and what they represent."', xpReward: 15 },
  { id: 'v4_w9', term: 4, week: 9, title: 'Test, Fix & Polish', objective: 'Get user feedback, debug your design, and make final improvements.', concepts: ['user testing', 'feedback', 'debugging', 'polish'], activity: 'Show your app plan to 3 people. Ask: What works? What is confusing? What would you add? Fix at least 2 things based on their feedback.', challengePrompt: 'Ask the AI: "Pretend you are testing my app for the first time. Here is what it does: [describe]. Give me honest feedback like a real user would."', xpReward: 15 },
  { id: 'v4_w10', term: 4, week: 10, title: 'Present My App!', objective: 'Present your complete app design like a real inventor. Celebrate a term of creation!', concepts: ['presentation', 'storytelling', 'reflection', 'celebration'], activity: 'Put everything together: problem, wireframes, logic, style guide, and user feedback. Present to family: "Here is the problem, here is my solution, here is how it works, and here is what I learned." Take a bow! 🎉', challengePrompt: 'Ask the AI: "I just finished designing my app! Help me write a 2-minute presentation script that explains the problem, my solution, and what I\'m most proud of."', xpReward: 30 },
];

export const VIBING_PROJECTS: VibingProject[] = [
  {
    id: 'proj_t1',
    term: 1,
    title: 'My Instruction Book',
    description: 'Create a fun instruction book that teaches someone how to do 3 everyday tasks using coding concepts (sequences, loops, conditions).',
    milestones: [
      { week: 2, title: 'Pick 3 tasks to teach', deliverable: 'List of 3 tasks (e.g., make toast, get ready for school, feed a pet)' },
      { week: 4, title: 'Write step-by-step algorithms', deliverable: 'Written instructions for each task with numbered steps' },
      { week: 6, title: 'Add conditions and loops', deliverable: 'Enhanced instructions with IF rules and REPEAT sections' },
      { week: 8, title: 'Illustrate the book', deliverable: 'Drawings for each instruction page' },
      { week: 10, title: 'Present to family', deliverable: 'Complete instruction book shared with someone' },
    ],
    finalDeliverable: 'A hand-made or digital instruction book with 3 tasks explained using coding concepts',
  },
  {
    id: 'proj_t2',
    term: 2,
    title: 'My Quiz Game',
    description: 'Build a quiz game about your favourite topic with scoring, feedback, and at least 10 questions.',
    milestones: [
      { week: 2, title: 'Choose topic and write questions', deliverable: '10 quiz questions with answers written out' },
      { week: 4, title: 'Add scoring system', deliverable: 'Rules for scoring: +1 for correct, track total' },
      { week: 6, title: 'Add feedback messages', deliverable: 'IF correct → "Well done!" IF wrong → hint + correct answer' },
      { week: 8, title: 'Test with a friend', deliverable: 'Someone plays the quiz, notes on what to improve' },
      { week: 10, title: 'Final version', deliverable: 'Polished quiz game played with family' },
    ],
    finalDeliverable: 'A working quiz game (paper-based or AI-assisted) with 10+ questions, scoring, and feedback',
  },
  {
    id: 'proj_t3',
    term: 3,
    title: 'My Story App',
    description: 'Create an interactive story with choices, characters, and multiple endings — built with AI assistance.',
    milestones: [
      { week: 1, title: 'Choose story idea', deliverable: 'One-paragraph story concept with setting and main character' },
      { week: 3, title: 'Plan the characters', deliverable: 'Character cards with name, look, personality, and role in story' },
      { week: 5, title: 'Write the logic/flow', deliverable: 'Story map showing all branches, choices, and endings' },
      { week: 7, title: 'Build with blocks/LLM', deliverable: 'Complete story text for all paths, created with AI help' },
      { week: 9, title: 'Test and share', deliverable: 'Let 2 people read it, collect feedback, make final version' },
    ],
    finalDeliverable: 'A working interactive story app or document with at least 2 choice points and 3 possible endings',
  },
  {
    id: 'proj_t4',
    term: 4,
    title: 'My Community Helper App',
    description: 'Design an app concept that solves a real problem in your school or neighbourhood.',
    milestones: [
      { week: 2, title: 'Identify the problem', deliverable: 'Written description of a real problem you noticed' },
      { week: 4, title: 'Design the solution', deliverable: 'Sketch of app screens and how it works' },
      { week: 6, title: 'Plan the features', deliverable: 'List of features with inputs, outputs, and conditions' },
      { week: 8, title: 'Build a prototype', deliverable: 'Paper prototype or AI-generated description of the app' },
      { week: 10, title: 'Present & pitch', deliverable: 'Present your app idea to family like a real inventor!' },
    ],
    finalDeliverable: 'A complete app design with problem statement, solution sketch, feature list, and presentation',
  },
];


// --- VIBING TERM PROJECTS (with detailed weekly milestones) ---

export const VIBING_TERM_PROJECTS: VibingTermProject[] = [
  {
    id: 'vtp_t3_dream_app',
    term: 3,
    title: 'Build My Dream App',
    description: 'You get to decide what app YOU want to make! Each week you will learn a new skill and add it to your app idea. By the end of the term, you will have planned and designed your very own app — just like a real inventor!',
    finalGoal: 'A complete app plan with drawings, instructions, logic, and a presentation to show your family and friends what you created.',
    weeklyMilestones: [
      {
        week: 1,
        title: 'What problem do I want to solve?',
        description: 'Every great app starts with a question: "What bothers me or someone I know?" Maybe your granny forgets to take her medicine. Maybe you wish you could find your socks faster. Maybe your dog needs a walk reminder! This week you will think about problems around you and pick ONE to solve with your app.',
        activity: 'Walk around your house and neighbourhood. Talk to your family. Write down 5 problems you notice (big or small!). Then pick your favourite one and draw a picture of the problem and how your app could help fix it.',
        concepts: ['design thinking', 'brainstorming', 'problem identification', 'empathy'],
        parentUpdate: 'Ufefe is learning to think like an inventor! She identified real problems and chose one to solve with an app idea.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 2,
        title: 'Drawing my app',
        description: 'Real app makers always draw their app on paper first — these drawings are called wireframes. It is like drawing the rooms of a house before you build it! This week you will draw what each screen of your app looks like, where the buttons go, and what happens when you press them.',
        activity: 'Get paper and coloured pencils. Draw 3-4 screens for your app: the first screen people see, the main screen where things happen, and a "done!" screen. Draw buttons, pictures, and text. Use arrows to show which screen comes next when you press a button.',
        concepts: ['wireframing', 'layout', 'user interface', 'screens and navigation'],
        parentUpdate: 'Ufefe drew wireframes (screen plans) for her app. She is learning about layout and how users move through an app.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 3,
        title: 'Giving instructions',
        description: 'A computer does not think for itself — you have to tell it EXACTLY what to do, step by step, like writing a recipe for a robot chef. This is called pseudocode. This week you will write the instructions for your app in plain English, so clear that even a robot could follow them!',
        activity: 'Pick one thing your app does (like "remind Granny to take medicine"). Write it as numbered steps: 1. Check the time. 2. If it is 8 o\'clock… 3. Show a message… Try to be as exact as a robot would need!',
        concepts: ['pseudocode', 'algorithms', 'step-by-step instructions', 'sequence'],
        parentUpdate: 'Ufefe wrote pseudocode (step-by-step instructions) for her app. She is learning that computers need exact, clear directions.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 4,
        title: 'Making things move',
        description: 'Apps are not just pictures — things MOVE! Buttons bounce when you press them, screens slide sideways, and little pictures can spin or fade in. This is animation! Animations are made by doing something over and over in a loop — like a flipbook where each page is slightly different.',
        activity: 'Make a flipbook animation on sticky notes: draw a simple picture (like a bouncing ball or a waving hand) that changes slightly on each note. Flip through them fast! Then decide: what in YOUR app should move? Write down 3 animations you want.',
        concepts: ['animation', 'loops', 'repetition', 'frames', 'movement'],
        parentUpdate: 'Ufefe explored animation and loops. She created a flipbook and planned what should move in her app.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 5,
        title: 'Making choices',
        description: 'Apps are smart because they can make choices! IF you press the red button, THEN play music. IF the time is 8 o\'clock, THEN show the reminder. IF you get the answer right, THEN add a point. This is called "if-then logic" and it is how apps know what to do next.',
        activity: 'Think about your app. Write 5 IF-THEN rules it needs. For example: IF user presses "start" THEN show the game. IF timer runs out THEN say "time\'s up!" Draw a simple flowchart with diamond shapes for yes/no choices.',
        concepts: ['if-then logic', 'conditions', 'decisions', 'branching', 'flowcharts'],
        parentUpdate: 'Ufefe learned about conditional logic (if/then decisions). She wrote rules for her app and drew a decision flowchart.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 6,
        title: 'Remembering things',
        description: 'Your app needs to remember things! A score, your name, how many times you pressed a button, what level you are on. These are called VARIABLES — like labelled boxes that hold information. The app can look inside the box, change what is in it, or use it to make decisions.',
        activity: 'List everything your app needs to remember (your name? a score? a list of tasks?). For each one, write the variable name and what goes inside. Example: playerName = "Ufefe", score = 0, level = 1. Draw your variables as labelled boxes.',
        concepts: ['variables', 'data storage', 'state', 'naming', 'values'],
        parentUpdate: 'Ufefe identified what data her app needs to store and learned about variables. She understands that apps remember information in named containers.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 7,
        title: 'Talking to users',
        description: 'An app needs to TALK to the person using it! It shows messages, asks questions, displays scores, and says "Well done!" or "Try again!" This is called INPUT (what the user gives the app, like typing their name) and OUTPUT (what the app shows back, like a greeting).',
        activity: 'Write a script of your app "talking" to a user. What does it say first? What does it ask? What does it show after the user does something? Act it out with a friend — one person is the app, the other is the user!',
        concepts: ['input and output', 'text display', 'user interaction', 'messages', 'feedback'],
        parentUpdate: 'Ufefe designed the conversations between her app and its users. She understands input (what users type) and output (what the app shows).',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 8,
        title: 'Making it pretty',
        description: 'Now it is time to make your app look AMAZING! Choose colours that go well together, pick fonts that are easy to read, add fun icons and pictures. Good design makes people WANT to use your app. Think about what makes your favourite apps look so nice!',
        activity: 'Create a "style guide" for your app on one page: pick 3 main colours (and colour them in!), choose what your buttons look like, decide on big or small text, and draw your app icon. Then redraw your favourite screen from Week 2 but now with all your colours and style!',
        concepts: ['colour theory', 'fonts and typography', 'visual design', 'user experience', 'icons'],
        parentUpdate: 'Ufefe created a visual style guide for her app. She chose colours, fonts, and icons — learning the basics of design thinking.',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 9,
        title: 'Testing and fixing',
        description: 'Even the best inventors make mistakes! That is totally okay — we just need to find the mistakes and fix them. This is called DEBUGGING. You will ask friends or family to "use" your app (by looking at your drawings and following your instructions) and tell you if anything is confusing or broken.',
        activity: 'Ask 2-3 people to look at your app plan. Read your instructions out loud to them. Ask: "Does this make sense? What is confusing? What would you change?" Write down their feedback and fix at least 2 things they mentioned.',
        concepts: ['debugging', 'user testing', 'feedback', 'iteration', 'improving'],
        parentUpdate: 'Ufefe conducted user testing with family/friends and practised debugging. She learned that feedback helps us make things better!',
        xpReward: 15,
        isCompleted: false
      },
      {
        week: 10,
        title: 'Show and tell!',
        description: 'You did it! You designed a WHOLE APP from start to finish! Now it is time to show the world what you created. Real inventors present their ideas to people — you will present your app to your family, explain how it works, and talk about what you learned along the way. Be proud!',
        activity: 'Put all your work together: your problem, your drawings, your instructions, your style guide, and your testing notes. Present it like a real inventor: explain the problem, show your solution, demonstrate how it works, and share what you are most proud of. Take a bow!',
        concepts: ['presentation', 'communication', 'reflection', 'pride in work', 'storytelling'],
        parentUpdate: 'Ufefe completed her term project! She presented her full app design, demonstrating understanding of design thinking, logic, variables, and user experience.',
        xpReward: 30,
        isCompleted: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// YEAR-LONG VIBING ARC — The journey from "what is code?"
// to "I built my own app!"
// ═══════════════════════════════════════════════════════════

export const VIBING_YEAR_ARC = {
  title: 'From Zero to App Builder',
  description: 'Starting in Term 3 — all foundations crammed into one term, then creating with AI in Term 4. Actual app building continues next year.',
  terms: [
    {
      term: 3,
      phase: 'Foundations & Building Blocks',
      summary: 'Learn ALL the basics fast: instructions, variables, conditions, loops, functions, events, lists, input/output, planning, and debugging.',
      endGoal: 'Understands every core coding concept. Can design a paper app using all of them together.',
      project: 'My First Mini-Project — a paper app using variables, conditions, loops, functions, lists, and events',
    },
    {
      term: 4,
      phase: 'Creating with AI & App Design',
      summary: 'Use AI as a creative partner. Design a real app from problem to prototype. Co-create stories, quizzes, and interactive experiences.',
      endGoal: 'Has designed, wireframed, and presented a complete app concept solving a real problem.',
      project: 'My Community App — a complete app design with wireframes, logic, style guide, and presentation',
    },
    {
      term: 'next_year',
      phase: 'Building the real app',
      summary: 'Take the designed app and actually build it with visual/block coding tools or AI-assisted code. Ship it!',
      endGoal: 'A working app that real people can use.',
      project: 'TBD — based on the app designed in Term 4',
    },
  ],
} as const;
