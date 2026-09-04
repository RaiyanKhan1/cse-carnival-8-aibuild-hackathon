import fs from 'node:fs';
import path from 'node:path';
import { prisma } from './prismaClient.js';

// RESOLVES THE REPO-LEVEL data/ FOLDER (BACKEND/../data RELATIVE TO BACKEND, BACKEND/src/db/seed.js → ../../../data)
const DATA_DIR = path.resolve(new URL('.', import.meta.url).pathname, '..', '..', '..', 'data');
// FALLBACK: WHEN CWD IS BACKEND, LOOK IN ../data
const FALLBACK_DATA_DIR = path.resolve(process.cwd(), '..', 'data');

// LOADS A JSON FILE FROM THE SEED DATA DIRECTORY, OR RETURNS AN EMPTY ARRAY
const load = (name) => {
  const primary = path.join(DATA_DIR, name);
  const fallback = path.join(FALLBACK_DATA_DIR, name);
  const file = fs.existsSync(primary) ? primary : (fs.existsSync(fallback) ? fallback : null);
  if (!file) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

// CLEARS ALL TABLES THEN REINSERTS THE SEED DATA
async function seed() {
  const schedules = load('schedules.json');
  const rooms = load('rooms.json');
  const events = load('events.json');
  const announcements = load('announcements.json');
  const assignments = load('assignments.json');

  await prisma.eventRegistration.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.room.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.assignment.deleteMany();

  for (const s of schedules) {
    await prisma.schedule.create({ data: s });
  }

  for (const r of rooms) {
    await prisma.room.create({
      data: {
        id: r.id,
        room_number: r.room_number,
        type: r.type,
        capacity: r.capacity,
        equipment: r.equipment || [],
        floor: r.floor,
        status: r.status,
      },
    });
    for (const b of r.bookings || []) {
      await prisma.roomBooking.create({
        data: {
          booking_id: b.booking_id,
          room_id: r.id,
          booked_by: b.booked_by,
          date: b.date,
          start_time: b.start_time,
          end_time: b.end_time,
          purpose: b.purpose ?? null,
        },
      });
    }
  }

  for (const e of events) {
    await prisma.event.create({
      data: {
        id: e.id,
        name: e.name,
        description: e.description ?? null,
        date: e.date,
        start_time: e.start_time,
        end_time: e.end_time,
        end_date: e.end_date,
        venue: e.venue ?? null,
        organizer: e.organizer ?? null,
        capacity: e.capacity,
        registered: e.registered ?? 0,
        status: e.status,
      },
    });
    for (const reg of e.registrations || []) {
      await prisma.eventRegistration.create({
        data: { event_id: e.id, student_id: reg.student_id, name: reg.name },
      });
    }
  }

  for (const a of announcements) {
    await prisma.announcement.create({
      data: {
        id: a.id,
        title: a.title,
        body: a.body ?? null,
        date: a.date,
        priority: a.priority,
        posted_by: a.posted_by ?? null,
        expires: a.expires ?? null,
      },
    });
  }

  for (const a of assignments) {
    await prisma.assignment.create({
      data: {
        id: a.id,
        course: a.course,
        course_title: a.course_title ?? null,
        title: a.title,
        description: a.description ?? null,
        assigned_date: a.assigned_date,
        deadline: a.deadline,
        submission_platform: a.submission_platform ?? null,
        status: a.status,
        marks: a.marks ?? 0,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`  schedules: ${schedules.length}`);
  console.log(`  rooms: ${rooms.length}`);
  console.log(`  events: ${events.length}`);
  console.log(`  announcements: ${announcements.length}`);
  console.log(`  assignments: ${assignments.length}`);
}

// RUNS THE SEED AND DISCONNECTS PRISMA ON COMPLETION OR ERROR
seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());