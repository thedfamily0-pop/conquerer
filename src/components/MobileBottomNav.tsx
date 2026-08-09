import { BookOpen, CalendarDays, Heart, Map, PenLine, ShieldCheck, ShoppingBag, Sparkles, Star } from 'lucide-react';

export type AppTab = 'today' | 'learn' | 'quest' | 'shine' | 'reading' | 'diary' | 'nomi' | 'store';
interface Props { activeTab: AppTab; onSelectTab: (tab: AppTab) => void; onOpenParentPortal: () => void; unreadAlertCount: number; nomiName: string; canAccessParentZone?: boolean; }
export function MobileBottomNav({ activeTab, onSelectTab, onOpenParentPortal, unreadAlertCount, nomiName, canAccessParentZone = false }: Props) {
  const items: { tab: AppTab; label: string; icon: typeof CalendarDays }[] = [
    { tab: 'today', label: 'Today', icon: CalendarDays }, { tab: 'learn', label: 'Learn', icon: Sparkles }, { tab: 'quest', label: 'Quest', icon: Map }, { tab: 'shine', label: 'Shine', icon: Heart }, { tab: 'reading', label: 'Read', icon: BookOpen }, { tab: 'diary', label: 'Diary', icon: PenLine }, { tab: 'nomi', label: nomiName, icon: Star }, { tab: 'store', label: 'Store', icon: ShoppingBag },
  ];
  return <nav className="mobile-bottom-nav" aria-label="Main navigation">{items.map(item => { const Icon = item.icon; return <button key={item.tab} onClick={() => onSelectTab(item.tab)} className={`mobile-nav-item ${activeTab === item.tab ? 'active' : ''}`}><Icon size={21}/><span>{item.label}</span></button>; })}{canAccessParentZone && <button onClick={onOpenParentPortal} className="mobile-nav-item" style={{ position: 'relative' }}><ShieldCheck size={21}/><span>Parent Zone</span>{unreadAlertCount > 0 && <i className="nav-badge">{unreadAlertCount}</i>}</button>}</nav>;
}
