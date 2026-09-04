import { prisma } from '../db/prismaClient.js';

// RETURNS ALL ANNOUNCEMENTS SORTED BY DATE DESCENDING
async function all() {
  return prisma.announcement.findMany({ orderBy: { date: 'desc' } });
}

// RETURNS A SINGLE ANNOUNCEMENT BY PRIMARY KEY
async function byId(id) {
  return prisma.announcement.findUnique({ where: { id } });
}

// CREATES A NEW ANNOUNCEMENT
async function create(data) {
  return prisma.announcement.create({ data });
}

// UPDATES AN EXISTING ANNOUNCEMENT OR RETURNS NULL IF MISSING
async function update(id, data) {
  const cur = await prisma.announcement.findUnique({ where: { id } });
  if (!cur) return null;
  return prisma.announcement.update({ where: { id }, data });
}

// DELETES AN ANNOUNCEMENT AND RETURNS THE NUMBER OF ROWS REMOVED
async function remove(id) {
  try { await prisma.announcement.delete({ where: { id } }); return 1; }
  catch { return 0; }
}

export const AnnouncementsModel = { all, byId, create, update, remove };