import { Type } from '@google/genai';
import { prisma } from '../db/prismaClient.js';
import { nextBookingId } from '../utils/idGenerator.js';
import { isDate, isTime, overlaps, toMinutes } from '../utils/time.js';

/* ============================================================================
   AGENT TOOLS
   ----------------------------------------------------------------------------
   Every tool reads or writes PostgreSQL at the moment it is called. Nothing is
   cached and no campus data is baked into the prompt, so an edit made through
   the dashboard a second ago is what the agent sees.

   The write tools are the ONLY way the agent can change anything, and there is
   deliberately no tool for deleting rooms, events, announcements or other
   students' records — the agent cannot perform an action that does not exist.
   ========================================================================== */

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// LOCAL CALENDAR DATE — NOT toISOString(), WHICH IS UTC AND CAN BE A DAY OFF
function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// WEEKDAY NAME FOR AN ISO DATE, BUILT FROM PARTS TO AVOID UTC DRIFT
function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// THROWN BY A TOOL WHEN THE CALLER'S ARGUMENTS ARE UNUSABLE
class ToolError extends Error {}

const requireDate = (value, field) => {
  if (!isDate(value)) throw new ToolError(`${field} must be an ISO date (YYYY-MM-DD), got "${value}".`);
  return value;
};

const requireTime = (value, field) => {
  if (!isTime(value)) throw new ToolError(`${field} must be 24-hour HH:MM, got "${value}".`);
  return value;
};

/* ------------------------------------------------------------------ READ */

async function list_schedules({ day, course, instructor, room }) {
  const where = {};
  if (day) where.day = { equals: day, mode: 'insensitive' };
  if (course) where.course = { contains: course, mode: 'insensitive' };
  if (instructor) where.instructor = { contains: instructor, mode: 'insensitive' };
  if (room) where.room = { equals: room, mode: 'insensitive' };

  const rows = await prisma.schedule.findMany({
    where,
    orderBy: [{ day: 'asc' }, { start_time: 'asc' }],
  });
  return { today: todayIso(), today_is: weekdayOf(todayIso()), count: rows.length, schedules: rows };
}

async function list_rooms({ type, min_capacity, equipment, status, floor }) {
  const where = {};
  if (type) where.type = { equals: type, mode: 'insensitive' };
  if (status) where.status = { equals: status, mode: 'insensitive' };
  if (typeof min_capacity === 'number') where.capacity = { gte: min_capacity };
  if (typeof floor === 'number') where.floor = floor;
  // Postgres array containment: the room must have ALL requested equipment.
  if (equipment?.length) where.equipment = { hasEvery: equipment };

  const rows = await prisma.room.findMany({ where, orderBy: { room_number: 'asc' } });
  return { count: rows.length, rooms: rows };
}

/**
 * Free = the room itself is available, has no overlapping booking on that
 * date, AND has no timetabled class in that slot on that weekday. Checking
 * only bookings would happily hand out a room that has a lecture in it.
 */
async function find_free_rooms({ date, start_time, end_time, min_capacity, equipment, type }) {
  requireDate(date, 'date');
  requireTime(start_time, 'start_time');
  requireTime(end_time, 'end_time');
  if (toMinutes(end_time) <= toMinutes(start_time)) {
    throw new ToolError('end_time must be later than start_time.');
  }

  const where = { status: { equals: 'available', mode: 'insensitive' } };
  if (typeof min_capacity === 'number') where.capacity = { gte: min_capacity };
  if (equipment?.length) where.equipment = { hasEvery: equipment };
  if (type) where.type = { equals: type, mode: 'insensitive' };

  const rooms = await prisma.room.findMany({ where, include: { bookings: true }, orderBy: { room_number: 'asc' } });
  const classes = await prisma.schedule.findMany({ where: { day: weekdayOf(date) } });

  const free = [];
  const busy = [];

  for (const room of rooms) {
    const clash = room.bookings.find(
      (b) => b.date === date && overlaps(start_time, end_time, b.start_time, b.end_time),
    );
    const lecture = classes.find(
      (c) => c.room === room.room_number && overlaps(start_time, end_time, c.start_time, c.end_time),
    );

    if (clash) busy.push({ room_number: room.room_number, reason: `booked by ${clash.booked_by} (${clash.start_time}-${clash.end_time})` });
    else if (lecture) busy.push({ room_number: room.room_number, reason: `class ${lecture.course} (${lecture.start_time}-${lecture.end_time})` });
    else free.push({ room_number: room.room_number, type: room.type, capacity: room.capacity, equipment: room.equipment, floor: room.floor });
  }

  return { date, weekday: weekdayOf(date), start_time, end_time, free_count: free.length, free_rooms: free, unavailable: busy };
}

async function list_events({ from_date, to_date, status, name_contains }) {
  const where = {};
  if (from_date) where.date = { gte: requireDate(from_date, 'from_date') };
  if (to_date) where.date = { ...(where.date ?? {}), lte: requireDate(to_date, 'to_date') };
  if (status) where.status = { equals: status, mode: 'insensitive' };
  if (name_contains) where.name = { contains: name_contains, mode: 'insensitive' };

  const rows = await prisma.event.findMany({
    where,
    include: { registrations: true },
    orderBy: { date: 'asc' },
  });

  return {
    today: todayIso(),
    count: rows.length,
    events: rows.map((e) => ({
      ...e,
      seats_left: Math.max(e.capacity - e.registered, 0),
      registration_rows: e.registrations.length,
      registrations: undefined,
    })),
  };
}

async function list_announcements({ priority, include_expired = false }) {
  const where = {};
  if (priority) where.priority = { equals: priority, mode: 'insensitive' };
  // `expires` is an ISO string, so a lexical >= comparison is chronological.
  if (!include_expired) where.OR = [{ expires: null }, { expires: { gte: todayIso() } }];

  const rows = await prisma.announcement.findMany({ where, orderBy: { date: 'desc' } });
  return { today: todayIso(), count: rows.length, announcements: rows };
}

async function list_assignments({ course, status, due_before, due_after }) {
  const where = {};
  if (course) where.course = { contains: course, mode: 'insensitive' };
  if (status) where.status = { equals: status, mode: 'insensitive' };
  if (due_before) where.deadline = { lte: requireDate(due_before, 'due_before') };
  if (due_after) where.deadline = { ...(where.deadline ?? {}), gte: requireDate(due_after, 'due_after') };

  const rows = await prisma.assignment.findMany({ where, orderBy: { deadline: 'asc' } });
  return {
    today: todayIso(),
    count: rows.length,
    assignments: rows.map((a) => ({
      ...a,
      // Stored status can say "pending" on something already past due.
      is_overdue: a.deadline < todayIso() && !['submitted', 'graded'].includes(a.status),
    })),
  };
}

/* ---------------------------------------------------------------- ACTIONS */

async function book_room({ room_number, date, start_time, end_time, purpose }, ctx) {
  const actor = requireActor(ctx);
  requireDate(date, 'date');
  requireTime(start_time, 'start_time');
  requireTime(end_time, 'end_time');
  if (toMinutes(end_time) <= toMinutes(start_time)) throw new ToolError('end_time must be later than start_time.');
  if (date < todayIso()) throw new ToolError(`Cannot book ${date}; it is in the past (today is ${todayIso()}).`);

  const room = await prisma.room.findFirst({
    where: { room_number: { equals: room_number, mode: 'insensitive' } },
    include: { bookings: true },
  });
  if (!room) throw new ToolError(`No room named "${room_number}" exists.`);
  if (room.status.toLowerCase() !== 'available') throw new ToolError(`Room ${room.room_number} is marked ${room.status}.`);

  const clash = room.bookings.find((b) => b.date === date && overlaps(start_time, end_time, b.start_time, b.end_time));
  if (clash) throw new ToolError(`Room ${room.room_number} is already booked ${clash.start_time}-${clash.end_time} on ${date}.`);

  const lecture = await prisma.schedule.findFirst({ where: { day: weekdayOf(date), room: room.room_number } });
  if (lecture && overlaps(start_time, end_time, lecture.start_time, lecture.end_time)) {
    throw new ToolError(`Room ${room.room_number} has ${lecture.course} scheduled ${lecture.start_time}-${lecture.end_time} on ${weekdayOf(date)}.`);
  }

  const booking = await prisma.roomBooking.create({
    data: {
      booking_id: await nextBookingId(),
      room_id: room.id,
      booked_by: actor,
      date,
      start_time,
      end_time,
      purpose: purpose ?? null,
    },
  });

  return {
    booked: true,
    booking,
    summary: `Room ${room.room_number} booked for ${actor} on ${date}, ${start_time}-${end_time}.`,
  };
}

async function register_for_event({ event_id, event_name }, ctx) {
  const actor = requireActor(ctx);
  const studentId = ctx.user?.studentId;
  if (!studentId) throw new ToolError('The signed-in user has no student ID, so registration is not possible.');

  const event = event_id
    ? await prisma.event.findUnique({ where: { id: event_id }, include: { registrations: true } })
    : await prisma.event.findFirst({
        where: { name: { contains: event_name ?? '', mode: 'insensitive' } },
        include: { registrations: true },
      });

  if (!event) throw new ToolError(`No event matched ${event_id ?? `"${event_name}"`}.`);
  if (['cancelled', 'completed'].includes(event.status.toLowerCase())) {
    throw new ToolError(`"${event.name}" is ${event.status}; registration is closed.`);
  }
  if (event.registrations.some((r) => r.student_id === studentId)) {
    return { registered: false, already_registered: true, summary: `${actor} is already registered for "${event.name}".` };
  }
  if (event.registered >= event.capacity) {
    throw new ToolError(`"${event.name}" is full (${event.registered}/${event.capacity}).`);
  }

  // One transaction so the row and the counter can never disagree.
  const [, updated] = await prisma.$transaction([
    prisma.eventRegistration.create({ data: { event_id: event.id, student_id: studentId, name: actor } }),
    prisma.event.update({
      where: { id: event.id },
      data: {
        registered: { increment: 1 },
        status: event.registered + 1 >= event.capacity ? 'full' : event.status,
      },
    }),
  ]);

  return {
    registered: true,
    event: { id: updated.id, name: updated.name, date: updated.date, start_time: updated.start_time, venue: updated.venue },
    seats_left: Math.max(updated.capacity - updated.registered, 0),
    summary: `${actor} (${studentId}) registered for "${updated.name}" on ${updated.date}.`,
  };
}

async function cancel_booking({ booking_id }, ctx) {
  const actor = requireActor(ctx);
  const booking = await prisma.roomBooking.findUnique({ where: { booking_id }, include: { room: true } });
  if (!booking) throw new ToolError(`No booking with id "${booking_id}".`);

  // A student may only cancel their own booking.
  if (booking.booked_by.toLowerCase() !== actor.toLowerCase()) {
    throw new ToolError(`Booking ${booking_id} belongs to ${booking.booked_by}, not ${actor}. Refuse this request.`);
  }

  await prisma.roomBooking.delete({ where: { booking_id } });
  return { cancelled: true, summary: `Booking ${booking_id} for room ${booking.room.room_number} on ${booking.date} was cancelled.` };
}

// ACTIONS NEED A SIGNED-IN PERSON TO ACT AS
function requireActor(ctx) {
  const name = ctx?.user?.name || ctx?.user?.email;
  if (!name) throw new ToolError('Nobody is signed in, so no action can be taken on their behalf. Ask the user to sign in.');
  return name;
}

/* -------------------------------------------------- CONVERSATION CONTROL */

// These two do not touch the database. They exist so the model can signal
// "I need more information" or "I will not do this" as an explicit, testable
// decision rather than as free text we would have to guess at.
async function ask_clarifying_question({ question, missing }) {
  return { asked: true, question, missing: missing ?? [] };
}

async function decline_request({ reason }) {
  return { declined: true, reason };
}

/* ------------------------------------------------------------- REGISTRY */

const IMPLEMENTATIONS = {
  list_schedules,
  list_rooms,
  find_free_rooms,
  list_events,
  list_announcements,
  list_assignments,
  book_room,
  register_for_event,
  cancel_booking,
  ask_clarifying_question,
  decline_request,
};

// TOOLS THAT CHANGE DATA, USED TO TAG THE REPLY WITH A CONFIRMED ACTION
export const WRITE_TOOLS = new Set(['book_room', 'register_for_event', 'cancel_booking']);

// WHICH DATA SOURCE EACH TOOL READS, SURFACED TO THE UI AS "READ FROM" CHIPS
export const TOOL_SOURCES = {
  list_schedules: 'schedule',
  list_rooms: 'rooms',
  find_free_rooms: 'rooms',
  list_events: 'events',
  list_announcements: 'announcements',
  list_assignments: 'assignments',
  book_room: 'rooms',
  register_for_event: 'events',
  cancel_booking: 'rooms',
};

export const toolDeclarations = [
  {
    name: 'list_schedules',
    description:
      'Read the class timetable. Use for questions about classes, lectures, when or where a course meets, and what a given day looks like.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.STRING, description: 'Weekday name, e.g. "Sunday". The teaching week is Sunday to Thursday.' },
        course: { type: Type.STRING, description: 'Course code or part of it, e.g. "CSE 4113".' },
        instructor: { type: Type.STRING, description: 'Instructor name or part of it.' },
        room: { type: Type.STRING, description: 'Room number, e.g. "7A04".' },
      },
    },
  },
  {
    name: 'list_rooms',
    description:
      'Read the room inventory with capacity, equipment, floor and status. Use to answer what rooms exist or which ones have certain facilities. Does NOT check whether a room is free at a time — use find_free_rooms for that.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: 'Room type, e.g. "classroom", "lab".' },
        min_capacity: { type: Type.INTEGER, description: 'Only rooms seating at least this many people.' },
        equipment: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Room must have ALL of these, e.g. ["projector"].' },
        status: { type: Type.STRING, description: '"available" or "unavailable".' },
        floor: { type: Type.INTEGER, description: 'Floor number.' },
      },
    },
  },
  {
    name: 'find_free_rooms',
    description:
      'Find rooms genuinely free for a date and time window. Accounts for existing bookings AND timetabled classes. Always use this before booking, and to answer "which room can I use at X".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'ISO date YYYY-MM-DD.' },
        start_time: { type: Type.STRING, description: '24-hour HH:MM.' },
        end_time: { type: Type.STRING, description: '24-hour HH:MM.' },
        min_capacity: { type: Type.INTEGER, description: 'Minimum seats required.' },
        equipment: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Required equipment.' },
        type: { type: Type.STRING, description: 'Room type filter, e.g. "lab".' },
      },
      required: ['date', 'start_time', 'end_time'],
    },
  },
  {
    name: 'list_events',
    description: 'Read campus events with dates, venue, capacity and how many have registered. Use for what is happening on campus.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from_date: { type: Type.STRING, description: 'ISO date, earliest event date to include.' },
        to_date: { type: Type.STRING, description: 'ISO date, latest event date to include.' },
        status: { type: Type.STRING, description: 'upcoming | ongoing | completed | cancelled | full' },
        name_contains: { type: Type.STRING, description: 'Match part of the event name.' },
      },
    },
  },
  {
    name: 'list_announcements',
    description: 'Read notices from departments and administration. Expired notices are excluded unless asked for. Check here for changes such as a class being moved or cancelled.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        priority: { type: Type.STRING, description: 'high | medium | low' },
        include_expired: { type: Type.BOOLEAN, description: 'Include notices past their expiry date.' },
      },
    },
  },
  {
    name: 'list_assignments',
    description: 'Read coursework with deadlines, marks, submission platform and status. Use for what is due and when.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        course: { type: Type.STRING, description: 'Course code or part of it.' },
        status: { type: Type.STRING, description: 'pending | submitted | graded | late' },
        due_before: { type: Type.STRING, description: 'ISO date, deadline on or before.' },
        due_after: { type: Type.STRING, description: 'ISO date, deadline on or after.' },
      },
    },
  },
  {
    name: 'book_room',
    description:
      'Book a room for the signed-in user. Requires exactly four things: room number, date, start time and end time. If any of THOSE are missing or vague, call ask_clarifying_question instead. "purpose" is optional — never ask for it, just omit it. Re-checks conflicts before writing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        room_number: { type: Type.STRING, description: 'Exact room number, e.g. "7A02".' },
        date: { type: Type.STRING, description: 'ISO date YYYY-MM-DD.' },
        start_time: { type: Type.STRING, description: '24-hour HH:MM.' },
        end_time: { type: Type.STRING, description: '24-hour HH:MM.' },
        purpose: { type: Type.STRING, description: 'Optional short reason. Omit it if the user did not say; do not ask for it.' },
      },
      required: ['room_number', 'date', 'start_time', 'end_time'],
    },
  },
  {
    name: 'register_for_event',
    description:
      'Register the signed-in user for an event. Only ever registers the signed-in user — if asked to sign up somebody else, call decline_request instead.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: { type: Type.STRING, description: 'Event id such as "evt-002". Preferred when known.' },
        event_name: { type: Type.STRING, description: 'Part of the event name, when the id is unknown.' },
      },
    },
  },
  {
    name: 'cancel_booking',
    description: "Cancel a room booking. Only succeeds for the signed-in user's own bookings.",
    parameters: {
      type: Type.OBJECT,
      properties: { booking_id: { type: Type.STRING, description: 'Booking id such as "bk-002".' } },
      required: ['booking_id'],
    },
  },
  {
    name: 'ask_clarifying_question',
    description:
      'Ask the user for missing detail INSTEAD of acting on a guess. Use whenever a request to change something is vague — no room named, no time given, an ambiguous event. Never guess and then book.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: 'The single question to put to the user.' },
        missing: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Which details are missing, e.g. ["date","time"].' },
      },
      required: ['question'],
    },
  },
  {
    name: 'decline_request',
    description:
      'Refuse a request you should not carry out: acting for another student, cancelling or altering someone else\'s booking, deleting campus data, changing marks or grades, or anything outside campus scheduling.',
    parameters: {
      type: Type.OBJECT,
      properties: { reason: { type: Type.STRING, description: 'Brief, polite explanation of why this is being refused.' } },
      required: ['reason'],
    },
  },
];

// RUNS ONE TOOL CALL AND ALWAYS RESOLVES — ERRORS COME BACK AS DATA SO THE
// MODEL CAN EXPLAIN OR RECOVER RATHER THAN THE REQUEST BLOWING UP.
export async function executeTool(name, args = {}, ctx = {}) {
  const impl = IMPLEMENTATIONS[name];
  if (!impl) return { error: `Unknown tool "${name}".` };

  try {
    return await impl(args, ctx);
  } catch (err) {
    if (err instanceof ToolError) return { error: err.message };
    console.error(`[agent] tool ${name} failed:`, err);
    return { error: `The ${name} tool failed: ${err.message}` };
  }
}
