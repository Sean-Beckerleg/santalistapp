export type Deed = { text: string; pts: number; date: number };
export type Child = { id: string; name: string; deeds: Deed[] };

export const METER_RANGE = 10; // meter spans -10 .. +10

export const GOOD_DEEDS: [string, number][] = [
  ['Did chores', 2],
  ['Helped someone', 3],
  ['Shared nicely', 2],
  ['Good manners', 1],
  ['Homework done', 2],
];
export const BAD_DEEDS: [string, number][] = [
  ['Fighting', -3],
  ['Not listening', -2],
  ['Talking back', -2],
  ['Lying', -3],
  ['Messy room', -1],
];

export const score = (c: Child) => c.deeds.reduce((s, d) => s + d.pts, 0);
/** 0 or greater is Nice, negative is Naughty. */
export const isNice = (c: Child) => score(c) >= 0;
export const fmtPts = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** 0..1 position of the meter needle. */
export function meterPos(total: number) {
  const clamped = Math.max(-METER_RANGE, Math.min(METER_RANGE, total));
  return (clamped + METER_RANGE) / (2 * METER_RANGE);
}

export const newId = () =>
  'k' + Date.now() + Math.random().toString(36).slice(2, 6);

export type DayGroup = {
  key: string;
  label: string;
  total: number;
  good: number;
  bad: number;
  /** newest first, with index into child.deeds for removal */
  items: { deed: Deed; index: number }[];
};

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function groupByDay(c: Child): DayGroup[] {
  const map = new Map<string, DayGroup>();
  c.deeds.forEach((deed, index) => {
    const key = dayKey(deed.date);
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        label: new Date(deed.date).toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        }),
        total: 0, good: 0, bad: 0, items: [],
      };
      map.set(key, g);
    }
    g.total += deed.pts;
    deed.pts >= 0 ? g.good++ : g.bad++;
    g.items.unshift({ deed, index }); // newest first within the day
  });
  return [...map.values()].sort(
    (a, b) => b.items[0].deed.date - a.items[0].deed.date,
  );
}

export const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export function countdownToChristmas(now = new Date()) {
  if (now.getMonth() === 11 && now.getDate() === 25) return null; // it's Christmas!
  let target = new Date(now.getFullYear(), 11, 25);
  if (now > target) target = new Date(now.getFullYear() + 1, 11, 25);
  const ms = target.getTime() - now.getTime();
  return {
    d: Math.floor(ms / 864e5),
    h: Math.floor((ms % 864e5) / 36e5),
    m: Math.floor((ms % 36e5) / 6e4),
    s: Math.floor((ms % 6e4) / 1e3),
  };
}
