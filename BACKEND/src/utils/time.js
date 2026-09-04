export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isTime = (t) => typeof t === 'string' && HHMM.test(t);
export const isDate = (d) => typeof d === 'string' && ISO_DATE.test(d);

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const a1 = toMinutes(aStart), a2 = toMinutes(aEnd);
  const b1 = toMinutes(bStart), b2 = toMinutes(bEnd);
  return !(a2 <= b1 || b2 <= a1);
};

export const todayName = (d = new Date()) => DAYS[d.getDay()];
export const isoDate = (d = new Date()) => d.toISOString().slice(0, 10);
export const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
};