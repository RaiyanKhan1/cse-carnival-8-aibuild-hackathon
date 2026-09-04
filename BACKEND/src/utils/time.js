// DAY NAMES ACCEPTED IN SCHEDULES (AUST WEEK: SUNDAY–THURSDAY)
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// REGEX FOR 24-HOUR HH:MM STRINGS
export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// REGEX FOR ISO YYYY-MM-DD DATE STRINGS
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// RETURNS TRUE IF THE STRING MATCHES HH:MM
export const isTime = (t) => typeof t === 'string' && HHMM.test(t);

// RETURNS TRUE IF THE STRING MATCHES YYYY-MM-DD
export const isDate = (d) => typeof d === 'string' && ISO_DATE.test(d);

// CONVERTS HH:MM INTO TOTAL MINUTES SINCE MIDNIGHT
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// RETURNS TRUE IF THE TWO HALF-OPEN TIME WINDOWS OVERLAP
export const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const a1 = toMinutes(aStart), a2 = toMinutes(aEnd);
  const b1 = toMinutes(bStart), b2 = toMinutes(bEnd);
  return !(a2 <= b1 || b2 <= a1);
};

// RETURNS THE ENGLISH NAME FOR A GIVEN DATE (DEFAULT: TODAY)
export const todayName = (d = new Date()) => DAYS[d.getDay()];

// RETURNS THE ISO DATE STRING FOR A GIVEN DATE (DEFAULT: TODAY)
export const isoDate = (d = new Date()) => d.toISOString().slice(0, 10);

// RETURNS THE ISO DATE STRING FOR TODAY PLUS N DAYS
export const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
};