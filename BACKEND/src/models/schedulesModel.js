import { prisma } from '../db/prismaClient.js';

// RETURNS ALL SCHEDULE ENTRIES SORTED BY DAY AND START TIME
async function all() {
  return prisma.schedule.findMany({ orderBy: [{ day: 'asc' }, { start_time: 'asc' }] });
}

// RETURNS A SINGLE SCHEDULE ENTRY BY PRIMARY KEY
async function byId(id) {
  return prisma.schedule.findUnique({ where: { id } });
}

// RETURNS ALL SCHEDULE ENTRIES FOR A GIVEN COURSE CODE
async function byCourse(course) {
  return prisma.schedule.findMany({ where: { course: { equals: course } } });
}

// INSERTS A NEW SCHEDULE ENTRY
async function create(data) {
  return prisma.schedule.create({ data });
}

// UPDATES AN EXISTING SCHEDULE ENTRY OR RETURNS NULL IF MISSING
async function update(id, data) {
  const cur = await prisma.schedule.findUnique({ where: { id } });
  if (!cur) return null;
  return prisma.schedule.update({ where: { id }, data });
}

// DELETES A SCHEDULE ENTRY AND RETURNS THE NUMBER OF ROWS REMOVED
async function remove(id) {
  try { await prisma.schedule.delete({ where: { id } }); return 1; }
  catch { return 0; }
}

export const SchedulesModel = { all, byId, byCourse, create, update, remove };