import { getCurrentTermInfo } from '../data/termCalendar';
import { getWeekTheme } from '../data/termData';

export function TermBanner() {
  const info = getCurrentTermInfo();
  const now = new Date();

  // Nice date format: "Saturday, 8 August 2026"
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const niceDate = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Get weekly theme if in term
  const theme = !info.isHoliday ? getWeekTheme(info.term, info.week) : undefined;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.7)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontSize: '0.78rem',
      color: '#94a3b8',
      fontWeight: 600,
      letterSpacing: '0.02em',
      flexWrap: 'wrap',
      textAlign: 'center',
    }}>
      {info.isHoliday ? (
        <span>🏖️ Holiday · {info.holidayMessage} · {niceDate}</span>
      ) : (
        <span>
          📚 Week {info.week} of {info.termName} · {niceDate}
          {theme && <span style={{ color: '#a5b4fc' }}> · 🎯 {theme.theme}</span>}
        </span>
      )}
    </div>
  );
}
