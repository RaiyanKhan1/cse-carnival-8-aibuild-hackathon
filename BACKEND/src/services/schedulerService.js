import { prisma } from '../db/prismaClient.js';
import { isoDate } from '../utils/time.js';

// DELETES EXPIRED ANNOUNCEMENTS, EVENTS, AND ROOM BOOKINGS FROM THE DATABASE
async function cleanExpired() {
  const today = isoDate();

  const [annCount, eventCount, bookingCount] = await prisma.$transaction([
    prisma.announcement.deleteMany({ where: { expires: { lt: today } } }),
    prisma.event.deleteMany({ where: { end_date: { lt: today } } }),
    prisma.roomBooking.deleteMany({ where: { date: { lt: today } } }),
  ]);

  const total = annCount.count + eventCount.count + bookingCount.count;
  if (total > 0) {
    console.log(`[Scheduler] Removed ${annCount.count} announcements, ${eventCount.count} events, ${bookingCount.count} bookings`);
  }
}

// SCHEDULES THE NEXT CLEANUP RUN AT EXACTLY MIDNIGHT TOMORROW
function scheduleNext() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow - now;

  setTimeout(async () => {
    try {
      await cleanExpired();
    } catch (err) {
      console.error('[Scheduler] Error cleaning expired data:', err);
    } finally {
      scheduleNext();
    }
  }, msUntilMidnight);
}

// STARTS THE DAILY MIDNIGHT CLEANUP SCHEDULER
export function startScheduler() {
  scheduleNext();
  console.log('[Scheduler] Expired data cleaner scheduled for 12:00 AM daily');
}
