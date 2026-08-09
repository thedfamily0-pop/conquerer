// ============================================================
// termData.ts — CAPS ATP weekly themes & term info utility
// Uses SA school terms with 2026 reference dates
// ============================================================

export const CURRENT_YEAR = 2026;

export interface TermDateRange {
  term: 1 | 2 | 3 | 4;
  start: string; // ISO date
  end: string;   // ISO date
}

/** 2026 SA school term date ranges */
export const TERM_DATES_2026: TermDateRange[] = [
  { term: 1, start: '2026-01-14', end: '2026-03-27' },
  { term: 2, start: '2026-04-07', end: '2026-06-19' },
  { term: 3, start: '2026-07-14', end: '2026-09-25' },
  { term: 4, start: '2026-10-06', end: '2026-12-11' },
];

export interface TermInfo {
  termNumber: 1 | 2 | 3 | 4;
  weekNumber: number;
  dayOfTerm: number;
  termName: string;
}

/**
 * Returns current term info based on the current date.
 * If between terms (holiday), returns the next upcoming term at week 1.
 */
export function getTermInfo(now = new Date()): TermInfo {
  for (const range of TERM_DATES_2026) {
    const start = new Date(range.start);
    const end = new Date(range.end);
    end.setHours(23, 59, 59, 999);

    if (now >= start && now <= end) {
      const diffMs = now.getTime() - start.getTime();
      const dayOfTerm = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      const weekNumber = Math.max(1, Math.ceil(dayOfTerm / 7));
      return {
        termNumber: range.term,
        weekNumber,
        dayOfTerm,
        termName: `Term ${range.term}`,
      };
    }
  }

  // Holiday — find next upcoming term
  for (const range of TERM_DATES_2026) {
    const start = new Date(range.start);
    if (now < start) {
      return {
        termNumber: range.term,
        weekNumber: 1,
        dayOfTerm: 0,
        termName: `Term ${range.term}`,
      };
    }
  }

  // After all terms (Dec holidays) — default to Term 1 next year
  return { termNumber: 1, weekNumber: 1, dayOfTerm: 0, termName: 'Term 1' };
}

// ============================================================
// CAPS Grade 3 Life Skills ATP Weekly Themes
// ============================================================

export interface WeeklyTheme {
  term: number;
  week: number;
  theme: string;
  subjects: string[];
  objectives: string[];
}

export const WEEKLY_THEMES: WeeklyTheme[] = [
  // TERM 1 — Beginning Knowledge & Personal Well-being
  { term: 1, week: 1, theme: 'About Me — My Identity', subjects: ['Beginning Knowledge', 'Personal & Social Well-being'], objectives: ['Identify personal strengths and qualities', 'Describe family structure and roles'] },
  { term: 1, week: 2, theme: 'My Body & Healthy Living', subjects: ['Beginning Knowledge', 'Physical Education'], objectives: ['Name body parts and their functions', 'Understand importance of hygiene and nutrition'] },
  { term: 1, week: 3, theme: 'Safety at Home & School', subjects: ['Personal & Social Well-being'], objectives: ['Identify dangers in the home', 'Know emergency numbers and safety rules'] },
  { term: 1, week: 4, theme: 'Road Safety & Transport', subjects: ['Beginning Knowledge'], objectives: ['Understand pedestrian rules', 'Identify traffic signs and signals'] },
  { term: 1, week: 5, theme: 'Rights & Responsibilities', subjects: ['Personal & Social Well-being'], objectives: ['Know children\'s rights', 'Understand responsibilities at home and school'] },
  { term: 1, week: 6, theme: 'Emotions & Healthy Coping', subjects: ['Personal & Social Well-being', 'Creative Arts'], objectives: ['Name and describe different emotions', 'Practise healthy coping strategies'] },
  { term: 1, week: 7, theme: 'Friendship & Kindness', subjects: ['Personal & Social Well-being'], objectives: ['Describe qualities of a good friend', 'Practise sharing and empathy'] },
  { term: 1, week: 8, theme: 'Community Helpers', subjects: ['Beginning Knowledge'], objectives: ['Identify community workers and their roles', 'Understand how they keep us safe'] },
  { term: 1, week: 9, theme: 'Creative Movement & Dance', subjects: ['Creative Arts', 'Physical Education'], objectives: ['Express feelings through movement', 'Follow rhythm and beat patterns'] },
  { term: 1, week: 10, theme: 'Celebrations & Heritage', subjects: ['Beginning Knowledge', 'Creative Arts'], objectives: ['Explore South African cultural celebrations', 'Create art reflecting heritage'] },

  // TERM 2 — Natural Sciences & Technology
  { term: 2, week: 1, theme: 'Maps & Directions', subjects: ['Beginning Knowledge', 'Social Sciences'], objectives: ['Read simple maps and plans', 'Use directional language (left, right, north, south)'] },
  { term: 2, week: 2, theme: 'Weather & Seasons', subjects: ['Beginning Knowledge'], objectives: ['Observe and record daily weather', 'Describe seasonal changes in South Africa'] },
  { term: 2, week: 3, theme: 'Water — Our Precious Resource', subjects: ['Beginning Knowledge', 'Personal & Social Well-being'], objectives: ['Understand the water cycle', 'Practise water-saving habits'] },
  { term: 2, week: 4, theme: 'Plants & Growth', subjects: ['Beginning Knowledge'], objectives: ['Identify parts of a plant', 'Understand what plants need to grow'] },
  { term: 2, week: 5, theme: 'Animals & Habitats', subjects: ['Beginning Knowledge'], objectives: ['Sort animals by habitat type', 'Research a South African animal'] },
  { term: 2, week: 6, theme: 'Recycling & Environment', subjects: ['Beginning Knowledge', 'Personal & Social Well-being'], objectives: ['Understand reduce, reuse, recycle', 'Identify recyclable materials'] },
  { term: 2, week: 7, theme: 'Visual Arts — Colour & Pattern', subjects: ['Creative Arts'], objectives: ['Mix primary colours to make secondary', 'Create repeating patterns in art'] },
  { term: 2, week: 8, theme: 'Music & Rhythm', subjects: ['Creative Arts', 'Physical Education'], objectives: ['Keep a steady beat', 'Learn South African songs with actions'] },
  { term: 2, week: 9, theme: 'Communication Then & Now', subjects: ['Beginning Knowledge', 'Social Sciences'], objectives: ['Compare old and new communication methods', 'Understand how technology has changed communication'] },
  { term: 2, week: 10, theme: 'South African Heritage', subjects: ['Social Sciences', 'Creative Arts'], objectives: ['Research important SA landmarks', 'Celebrate cultural diversity'] },

  // TERM 3 — Creative Arts & Physical Education
  { term: 3, week: 1, theme: 'Visual Arts — Colour & Shape', subjects: ['Creative Arts'], objectives: ['Explore primary and secondary colours', 'Identify and create basic shapes in artwork'] },
  { term: 3, week: 2, theme: 'Visual Arts — Patterns & Texture', subjects: ['Creative Arts'], objectives: ['Find patterns in nature', 'Create textured art using different materials'] },
  { term: 3, week: 3, theme: 'Drawing & Observation', subjects: ['Creative Arts'], objectives: ['Draw from observation (still life)', 'Develop fine motor control through sketching'] },
  { term: 3, week: 4, theme: 'Performing Arts — Movement & Dance', subjects: ['Creative Arts', 'Physical Education'], objectives: ['Express feelings through creative movement', 'Learn a simple dance routine'] },
  { term: 3, week: 5, theme: 'Drama & Storytelling', subjects: ['Creative Arts'], objectives: ['Act out stories through role-play', 'Use voice and body for expression'] },
  { term: 3, week: 6, theme: 'Music — Rhythm & Beat', subjects: ['Creative Arts', 'Physical Education'], objectives: ['Clap and tap rhythm patterns', 'Create body percussion sequences'] },
  { term: 3, week: 7, theme: 'Music — Singing & Melody', subjects: ['Creative Arts'], objectives: ['Sing South African songs', 'Explore high and low pitch'] },
  { term: 3, week: 8, theme: 'Craft & Design', subjects: ['Creative Arts'], objectives: ['Use recycled materials to design and build', 'Follow a simple design process'] },
  { term: 3, week: 9, theme: 'Physical Education — Games & Sport', subjects: ['Physical Education'], objectives: ['Participate in team games', 'Practise throwing, catching, and coordination'] },
  { term: 3, week: 10, theme: 'Arts Showcase & Celebration', subjects: ['Creative Arts', 'Physical Education'], objectives: ['Present creative work to an audience', 'Reflect on growth and achievements'] },

  // TERM 4 — Personal & Social Well-being
  { term: 4, week: 1, theme: 'Healthy Relationships', subjects: ['Personal & Social Well-being'], objectives: ['Describe healthy family and friend relationships', 'Understand personal boundaries'] },
  { term: 4, week: 2, theme: 'Responsibilities at Home', subjects: ['Personal & Social Well-being'], objectives: ['Identify age-appropriate home responsibilities', 'Practise time management'] },
  { term: 4, week: 3, theme: 'Conflict Resolution', subjects: ['Personal & Social Well-being'], objectives: ['Use I-messages to express feelings', 'Solve disagreements peacefully'] },
  { term: 4, week: 4, theme: 'Bullying Awareness', subjects: ['Personal & Social Well-being'], objectives: ['Define bullying and identify types', 'Know how to be an upstander'] },
  { term: 4, week: 5, theme: 'Online Safety', subjects: ['Personal & Social Well-being', 'Beginning Knowledge'], objectives: ['Understand personal information safety', 'Practise safe internet habits'] },
  { term: 4, week: 6, theme: 'Goal Setting & Growth Mindset', subjects: ['Personal & Social Well-being'], objectives: ['Set personal SMART goals', 'Understand the power of "yet"'] },
  { term: 4, week: 7, theme: 'Money & Saving', subjects: ['Beginning Knowledge', 'Personal & Social Well-being'], objectives: ['Distinguish needs from wants', 'Understand basic saving concepts'] },
  { term: 4, week: 8, theme: 'Giving Back — Community Service', subjects: ['Personal & Social Well-being'], objectives: ['Plan a kindness or service activity', 'Understand the impact of helping others'] },
  { term: 4, week: 9, theme: 'Looking After Our Earth', subjects: ['Personal & Social Well-being', 'Beginning Knowledge'], objectives: ['Understand environmental responsibility', 'Make a pledge for the planet'] },
  { term: 4, week: 10, theme: 'Year Reflection & Celebration', subjects: ['Personal & Social Well-being', 'Creative Arts'], objectives: ['Celebrate personal growth', 'Set goals for the next year'] },
];

/**
 * Returns the Life Skills ATP theme for the given term and week.
 */
export function getWeekTheme(termNumber: number, weekNumber: number): WeeklyTheme | undefined {
  return WEEKLY_THEMES.find(t => t.term === termNumber && t.week === weekNumber);
}
