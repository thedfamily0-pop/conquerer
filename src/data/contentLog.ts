export interface ContentUploadLog {
  id: string;
  date: string;
  filename: string;
  fileSize: number;
  subjects: string[];
  itemCounts: { questions?: number; stories?: number; objectives?: number; vocab?: number };
  term: number;
  week: number;
}

const LOG_KEY = 'explorer_content_log_v1';

export function loadContentLog(): ContentUploadLog[] {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}

export function saveContentLog(log: ContentUploadLog[]): void {
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export function addLogEntry(entry: Omit<ContentUploadLog, 'id' | 'date'>): ContentUploadLog {
  const log = loadContentLog();
  const newEntry: ContentUploadLog = { ...entry, id: `log_${Date.now()}`, date: new Date().toISOString() };
  log.unshift(newEntry);
  saveContentLog(log.slice(0, 50));
  return newEntry;
}
