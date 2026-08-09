/** South African school year term calendar utility */

interface TermDates {
  term: number;
  termName: string;
  start: string; // MM-DD
  end: string;   // MM-DD
  weeks: number;
}

const TERMS: TermDates[] = [
  { term: 1, termName: 'Term 1', start: '01-15', end: '03-28', weeks: 11 },
  { term: 2, termName: 'Term 2', start: '04-09', end: '06-27', weeks: 11 },
  { term: 3, termName: 'Term 3', start: '07-22', end: '09-26', weeks: 10 },
  { term: 4, termName: 'Term 4', start: '10-07', end: '12-11', weeks: 10 },
];

export interface TermInfo {
  term: number;
  week: number;
  dayOfTerm: number;
  termName: string;
  dateDisplay: string;
  isHoliday: boolean;
  holidayMessage?: string;
}

function parseTermDate(year: number, mmdd: string): Date {
  const [month, day] = mmdd.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getCurrentTermInfo(now = new Date()): TermInfo {
  const year = now.getFullYear();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateDisplay = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;

  for (const t of TERMS) {
    const start = parseTermDate(year, t.start);
    const end = parseTermDate(year, t.end);
    end.setHours(23, 59, 59, 999);

    if (now >= start && now <= end) {
      const diffMs = now.getTime() - start.getTime();
      const dayOfTerm = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      const week = Math.min(Math.ceil(dayOfTerm / 7), t.weeks);

      return {
        term: t.term,
        week,
        dayOfTerm,
        termName: t.termName,
        dateDisplay,
        isHoliday: false,
      };
    }
  }

  // We're in a holiday period — find next term
  let nextTerm: TermDates | undefined;
  for (const t of TERMS) {
    const start = parseTermDate(year, t.start);
    if (now < start) {
      nextTerm = t;
      break;
    }
  }

  // If after all terms this year, next term is Term 1 next year
  if (!nextTerm) {
    const nextStart = parseTermDate(year + 1, TERMS[0].start);
    const daysUntil = Math.ceil((nextStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      term: 0,
      week: 0,
      dayOfTerm: 0,
      termName: 'Holiday',
      dateDisplay,
      isHoliday: true,
      holidayMessage: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until Term 1`,
    };
  }

  const nextStart = parseTermDate(year, nextTerm.start);
  const daysUntil = Math.ceil((nextStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    term: 0,
    week: 0,
    dayOfTerm: 0,
    termName: 'Holiday',
    dateDisplay,
    isHoliday: true,
    holidayMessage: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until ${nextTerm.termName}`,
  };
}
