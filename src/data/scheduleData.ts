// ============================================================
// scheduleData.ts — Data types & localStorage persistence for
// Schedule, Chores, Diary, and Nomi conversation history
// ============================================================

export interface ScheduleItem {
  id: string;
  dayOfWeek: number;       // 0=Sun … 6=Sat
  time: string;            // "HH:MM" 24-hour format
  title: string;
  emoji: string;
  color: string;           // hex colour for the event chip
  reminderMinutes: number; // minutes before event to notify
  notifyEmail: boolean;    // send email alert to parents
}

export interface ChoreTask {
  id: string;
  title: string;
  emoji: string;
  dueDate?: string;        // ISO date YYYY-MM-DD (optional)
  isCompleted: boolean;
  completedAt?: string;
  evidencePhotoUrl?: string; // EXIF-scrubbed data URL of completion proof
  xpReward: number;
  addedBy: string;         // "Dad" | "Mom"
  createdAt: string;
  requiresPhoto?: boolean; // Parent can require photo evidence
}

export interface DiaryEntry {
  id: string;
  date: string;            // YYYY-MM-DD
  content: string;
  mood: string;
  moodEmoji: string;
  createdAt: string;
}

export interface NomiMessage {
  role: 'nomi' | 'ufefe';
  content: string;
  timestamp: string;
}

// ── Storage keys ─────────────────────────────────────────────
const SCHEDULE_KEY = 'explorer_schedule_v1';
const CHORES_KEY   = 'explorer_chores_v1';
const DIARY_KEY    = 'explorer_diary_v1';

// ── Schedule helpers ─────────────────────────────────────────
export function loadSchedule(): ScheduleItem[] {
  try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY) || 'null') ?? DEFAULT_SCHEDULE; }
  catch { return DEFAULT_SCHEDULE; }
}
export function saveSchedule(items: ScheduleItem[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
}

// ── Chore helpers ────────────────────────────────────────────
export function loadChores(): ChoreTask[] {
  try { return JSON.parse(localStorage.getItem(CHORES_KEY) || '[]'); }
  catch { return []; }
}
export function saveChores(chores: ChoreTask[]): void {
  localStorage.setItem(CHORES_KEY, JSON.stringify(chores));
}

// ── Diary helpers ────────────────────────────────────────────
export function loadDiary(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(DIARY_KEY) || '[]'); }
  catch { return []; }
}
export function saveDiary(entries: DiaryEntry[]): void {
  localStorage.setItem(DIARY_KEY, JSON.stringify(entries));
}

const NOMI_HISTORY_KEY = 'explorer_nomi_history_v1';
export function loadNomiHistory(): NomiMessage[] { try { const stored = JSON.parse(localStorage.getItem(NOMI_HISTORY_KEY) || '[]'); return Array.isArray(stored) ? stored.slice(-50) : []; } catch { return []; } }
export function saveNomiHistory(messages: NomiMessage[]): void { localStorage.setItem(NOMI_HISTORY_KEY, JSON.stringify(messages.slice(-50))); }

// ── Constants ────────────────────────────────────────────────
export const DAY_NAMES  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const EMOJI_PICKER = [
  '⭐','🚀','📚','🏫','🎒','🏃','🏋️','🎨','🎵','🌳',
  '🍽️','🛁','🌙','☀️','🚌','🏊','⚽','🎮','🛍️','💊'
];
export const COLOR_PICKER = [
  '#f59e0b','#3b82f6','#8b5cf6','#14b8a6','#22c55e',
  '#f97316','#ec4899','#ef4444','#6366f1','#64748b'
];

// ── Default starter schedule (Mon–Fri school days) ────────────
export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id:'d_1', dayOfWeek:1, time:'06:30', title:'Wake Up & Get Ready',     emoji:'☀️', color:'#f59e0b', reminderMinutes:5,  notifyEmail:false },
  { id:'d_2', dayOfWeek:1, time:'07:30', title:'Leave for School 🚌',     emoji:'🚌', color:'#3b82f6', reminderMinutes:15, notifyEmail:true  },
  { id:'d_3', dayOfWeek:1, time:'14:30', title:'Homework Time',            emoji:'📚', color:'#8b5cf6', reminderMinutes:15, notifyEmail:false },
  { id:'d_4', dayOfWeek:1, time:'15:30', title:'Conquerer Learning App',   emoji:'🚀', color:'#14b8a6', reminderMinutes:10, notifyEmail:false },
  { id:'d_5', dayOfWeek:1, time:'17:00', title:'Free Play / Outdoor Time',emoji:'🌳', color:'#22c55e', reminderMinutes:5,  notifyEmail:false },
  { id:'d_6', dayOfWeek:1, time:'19:00', title:'Dinner Time',              emoji:'🍽️', color:'#f97316', reminderMinutes:15, notifyEmail:false },
  { id:'d_7', dayOfWeek:1, time:'20:00', title:'Bath & Bedtime Routine',   emoji:'🛁', color:'#60a5fa', reminderMinutes:10, notifyEmail:false },
  { id:'d_8', dayOfWeek:1, time:'20:30', title:'Lights Out 🌙',            emoji:'🌙', color:'#6366f1', reminderMinutes:15, notifyEmail:true  },
  // Copy for Tue-Fri
  { id:'d_9',  dayOfWeek:2, time:'06:30', title:'Wake Up & Get Ready',     emoji:'☀️', color:'#f59e0b', reminderMinutes:5,  notifyEmail:false },
  { id:'d_10', dayOfWeek:2, time:'07:30', title:'Leave for School 🚌',     emoji:'🚌', color:'#3b82f6', reminderMinutes:15, notifyEmail:true  },
  { id:'d_11', dayOfWeek:2, time:'14:30', title:'Homework Time',            emoji:'📚', color:'#8b5cf6', reminderMinutes:15, notifyEmail:false },
  { id:'d_12', dayOfWeek:2, time:'15:30', title:'Conquerer Learning App',   emoji:'🚀', color:'#14b8a6', reminderMinutes:10, notifyEmail:false },
  { id:'d_13', dayOfWeek:2, time:'19:00', title:'Dinner Time',              emoji:'🍽️', color:'#f97316', reminderMinutes:15, notifyEmail:false },
  { id:'d_14', dayOfWeek:2, time:'20:30', title:'Lights Out 🌙',            emoji:'🌙', color:'#6366f1', reminderMinutes:15, notifyEmail:true  },
  { id:'d_15', dayOfWeek:3, time:'06:30', title:'Wake Up & Get Ready',     emoji:'☀️', color:'#f59e0b', reminderMinutes:5,  notifyEmail:false },
  { id:'d_16', dayOfWeek:3, time:'07:30', title:'Leave for School 🚌',     emoji:'🚌', color:'#3b82f6', reminderMinutes:15, notifyEmail:true  },
  { id:'d_17', dayOfWeek:3, time:'14:30', title:'Homework Time',            emoji:'📚', color:'#8b5cf6', reminderMinutes:15, notifyEmail:false },
  { id:'d_18', dayOfWeek:3, time:'15:30', title:'Conquerer Learning App',   emoji:'🚀', color:'#14b8a6', reminderMinutes:10, notifyEmail:false },
  { id:'d_19', dayOfWeek:3, time:'19:00', title:'Dinner Time',              emoji:'🍽️', color:'#f97316', reminderMinutes:15, notifyEmail:false },
  { id:'d_20', dayOfWeek:3, time:'20:30', title:'Lights Out 🌙',            emoji:'🌙', color:'#6366f1', reminderMinutes:15, notifyEmail:true  },
  { id:'d_21', dayOfWeek:4, time:'06:30', title:'Wake Up & Get Ready',     emoji:'☀️', color:'#f59e0b', reminderMinutes:5,  notifyEmail:false },
  { id:'d_22', dayOfWeek:4, time:'07:30', title:'Leave for School 🚌',     emoji:'🚌', color:'#3b82f6', reminderMinutes:15, notifyEmail:true  },
  { id:'d_23', dayOfWeek:4, time:'14:30', title:'Homework Time',            emoji:'📚', color:'#8b5cf6', reminderMinutes:15, notifyEmail:false },
  { id:'d_24', dayOfWeek:4, time:'15:30', title:'Conquerer Learning App',   emoji:'🚀', color:'#14b8a6', reminderMinutes:10, notifyEmail:false },
  { id:'d_25', dayOfWeek:4, time:'19:00', title:'Dinner Time',              emoji:'🍽️', color:'#f97316', reminderMinutes:15, notifyEmail:false },
  { id:'d_26', dayOfWeek:4, time:'20:30', title:'Lights Out 🌙',            emoji:'🌙', color:'#6366f1', reminderMinutes:15, notifyEmail:true  },
  { id:'d_27', dayOfWeek:5, time:'06:30', title:'Wake Up & Get Ready',     emoji:'☀️', color:'#f59e0b', reminderMinutes:5,  notifyEmail:false },
  { id:'d_28', dayOfWeek:5, time:'07:30', title:'Leave for School 🚌',     emoji:'🚌', color:'#3b82f6', reminderMinutes:15, notifyEmail:true  },
  { id:'d_29', dayOfWeek:5, time:'14:30', title:'Homework Time',            emoji:'📚', color:'#8b5cf6', reminderMinutes:15, notifyEmail:false },
  { id:'d_30', dayOfWeek:5, time:'15:30', title:'Conquerer Learning App',   emoji:'🚀', color:'#14b8a6', reminderMinutes:10, notifyEmail:false },
  { id:'d_31', dayOfWeek:5, time:'19:00', title:'Dinner Time',              emoji:'🍽️', color:'#f97316', reminderMinutes:15, notifyEmail:false },
  { id:'d_32', dayOfWeek:5, time:'20:30', title:'Lights Out 🌙',            emoji:'🌙', color:'#6366f1', reminderMinutes:15, notifyEmail:true  },
];
