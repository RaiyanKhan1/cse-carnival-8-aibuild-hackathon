import { prisma } from '../db/prismaClient.js';

// RETURNS ALL EVENTS WITH REGISTRATIONS SORTED BY DATE AND START TIME
async function all() {
  return prisma.event.findMany({
    orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
    include: { registrations: true },
  });
}

// RETURNS A SINGLE EVENT WITH REGISTRATIONS BY PRIMARY KEY
async function byId(id) {
  return prisma.event.findUnique({
    where: { id },
    include: { registrations: true },
  });
}

// CREATES A NEW EVENT WITHOUT TOUCHING ITS REGISTRATIONS
async function create(data) {
  const { registrations: _r, ...rest } = data;
  return prisma.event.create({ data: rest });
}

// UPDATES AN EXISTING EVENT OR RETURNS NULL IF MISSING
async function update(id, data) {
  const cur = await prisma.event.findUnique({ where: { id } });
  if (!cur) return null;
  return prisma.event.update({ where: { id }, data });
}

// DELETES AN EVENT AND RETURNS THE NUMBER OF ROWS REMOVED
async function remove(id) {
  try { await prisma.event.delete({ where: { id } }); return 1; }
  catch { return 0; }
}

// ADDS A STUDENT REGISTRATION AND UPDATES THE EVENT REGISTRATION COUNT
async function register(eventId, student) {
  const ev = await byId(eventId);
  if (!ev) return { error: 'not_found' };
  if (ev.registrations.some(r => r.student_id === student.student_id)) return { error: 'already_registered' };
  if (ev.registered >= ev.capacity) return { error: 'full' };

  await prisma.eventRegistration.create({
    data: { event_id: eventId, student_id: student.student_id, name: student.name },
  });
  const newCount = ev.registered + 1;
  const newStatus = newCount >= ev.capacity ? 'full' : ev.status;
  await prisma.event.update({ where: { id: eventId }, data: { registered: newCount, status: newStatus } });
  return { event: await byId(eventId) };
}

// REMOVES A STUDENT REGISTRATION AND ADJUSTS EVENT STATUS IF NEEDED
async function unregister(eventId, studentId) {
  try {
    await prisma.eventRegistration.delete({
      where: { event_id_student_id: { event_id: eventId, student_id } },
    });
  } catch { return { error: 'not_registered' }; }

  const ev = await byId(eventId);
  if (ev && ev.status === 'full') {
    await prisma.event.update({ where: { id: eventId }, data: { status: 'upcoming' } });
  }
  return { event: await byId(eventId) };
}

export const EventsModel = { all, byId, create, update, remove, register, unregister };