export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDateES(isoDate?: string): string {
  if (!isoDate) return 'Sin fecha';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatFullDateES(isoDate?: string): string {
  if (!isoDate) return 'Sin fecha';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isDateOverdue(isoDate?: string, stage?: string): boolean {
  if (!isoDate || stage === 'publicado') return false;
  const today = getTodayISO();
  return isoDate < today;
}

export function isSameMonthAndYear(isoDate?: string, referenceDate: Date = new Date()): boolean {
  if (!isoDate) return false;
  const [y, m] = isoDate.split('-').map(Number);
  return y === referenceDate.getFullYear() && m === referenceDate.getMonth() + 1;
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CalendarDayCell {
  date: Date;
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthCalendarGrid(year: number, monthIndex: number): CalendarDayCell[] {
  const todayISO = getTodayISO();
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  // En España la semana empieza en lunes (0 = lunes ... 6 = domingo)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const startDate = new Date(year, monthIndex, 1 - startDayOfWeek);
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const iso = toISODateString(current);
    cells.push({
      date: current,
      iso,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === monthIndex,
      isToday: iso === todayISO,
    });
  }

  return cells;
}

export function getWeekCalendarGrid(referenceDate: Date): CalendarDayCell[] {
  const todayISO = getTodayISO();
  const dayOfWeek = (referenceDate.getDay() + 6) % 7; // Lunes = 0
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - dayOfWeek);

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const iso = toISODateString(current);
    cells.push({
      date: current,
      iso,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === referenceDate.getMonth(),
      isToday: iso === todayISO,
    });
  }
  return cells;
}
