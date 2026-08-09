// ============================================================
// projectData.ts — Term project tracker with localStorage
// ============================================================

export interface ProjectMilestone {
  id: string;
  title: string;
  weekNumber: number;
  isCompleted: boolean;
  completedAt?: string;
  parentNote?: string;
}

export interface TermProject {
  id: string;
  title: string;
  description: string;
  term: number;
  milestones: ProjectMilestone[];
  createdAt: string;
  completedAt?: string;
}

// ── Storage key ──────────────────────────────────────────────
const PROJECTS_KEY = 'explorer_term_projects_v1';

// ── Load/Save helpers ────────────────────────────────────────
export function loadProjects(): TermProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveProjects(projects: TermProject[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
