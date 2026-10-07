export interface OpeningHoursStatus {
  isOpenNow: boolean | null;
  is247: boolean;
  displayText: string;
  statusClass: 'open' | 'closed' | 'unknown';
}

export function parseOpeningHours(openingHoursStr: string | null | undefined): OpeningHoursStatus {
  if (!openingHoursStr || !openingHoursStr.trim()) {
    return {
      isOpenNow: null,
      is247: false,
      displayText: 'Hours unspecified',
      statusClass: 'unknown',
    };
  }

  const clean = openingHoursStr.trim();

  // Check 24/7 explicit string
  if (clean.toLowerCase().includes('24/7')) {
    return {
      isOpenNow: true,
      is247: true,
      displayText: 'Open 24/7',
      statusClass: 'open',
    };
  }

  const now = new Date();
  // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysOrder = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDay = daysOrder[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  try {
    const rules = clean.split(';');
    for (const rule of rules) {
      const parts = rule.trim().split(/\s+/);
      if (parts.length < 2) continue;

      const daySpec = parts[0];
      const timeSpec = parts[1];

      if (isDayMatch(currentDay, daySpec) && timeSpec) {
        const timeRanges = timeSpec.split(',');
        for (const range of timeRanges) {
          const [startStr, endStr] = range.split('-');
          if (!startStr || !endStr) continue;

          const startMins = parseTime(startStr);
          const endMins = parseTime(endStr);

          if (startMins !== null && endMins !== null) {
            let isOpen = false;
            if (endMins > startMins) {
              isOpen = currentMinutes >= startMins && currentMinutes <= endMins;
            } else {
              // Overnight hours e.g. 18:00-02:00
              isOpen = currentMinutes >= startMins || currentMinutes <= endMins;
            }

            if (isOpen) {
              return {
                isOpenNow: true,
                is247: false,
                displayText: `Open Now • Closes ${formatTime(endMins)}`,
                statusClass: 'open',
              };
            } else {
              return {
                isOpenNow: false,
                is247: false,
                displayText: `Closed • Opens ${formatTime(startMins)}`,
                statusClass: 'closed',
              };
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse opening hours string:', openingHoursStr);
  }

  return {
    isOpenNow: null,
    is247: false,
    displayText: clean,
    statusClass: 'unknown',
  };
}

function isDayMatch(currentDay: string, daySpec: string): boolean {
  if (daySpec === '24/7' || daySpec === 'Mo-Su' || daySpec === 'Su-Sa' || daySpec === 'Mo-Sa' || daySpec === 'PH') {
    return true;
  }
  const daysList = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  if (daySpec.includes('-')) {
    const [start, end] = daySpec.split('-');
    const startIndex = daysList.indexOf(start);
    const endIndex = daysList.indexOf(end);
    const currIndex = daysList.indexOf(currentDay);
    if (startIndex !== -1 && endIndex !== -1 && currIndex !== -1) {
      if (endIndex >= startIndex) {
        return currIndex >= startIndex && currIndex <= endIndex;
      }
    }
  }
  return daySpec.includes(currentDay);
}

function parseTime(timeStr: string): number | null {
  const parts = timeStr.trim().split(':');
  if (parts.length < 1) return null;
  const h = parseInt(parts[0], 10);
  const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  if (isNaN(h)) return null;
  return h * 60 + (isNaN(m) ? 0 : m);
}

function formatTime(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${h12}:${mStr} ${ampm}`;
}
