import { prisma } from '../db/prismaClient.js';

// RETURNS ALL ASSIGNMENTS SORTED BY DEADLINE ASCENDING
async function all() {
  return prisma.assignment.findMany({ orderBy: { deadline: 'asc' } });
}

// RETURNS A SINGLE ASSIGNMENT BY PRIMARY KEY
async function byId(id) {
  return prisma.assignment.findUnique({ where: { id } });
}

// RETURNS ASSIGNMENTS WHOSE DEADLINE FALLS WITHIN THE GIVEN DATE RANGE
async function dueBetween(startISO, endISO) {
  return prisma.assignment.findMany({
    where: { deadline: { gte: startISO, lte: endISO } },
    orderBy: { deadline: 'asc' },
  });
}

// CREATES A NEW ASSIGNMENT
async function create(data) {
  return prisma.assignment.create({ data });
}

// UPDATES AN EXISTING ASSIGNMENT OR RETURNS NULL IF MISSING
async function update(id, data) {
  const cur = await prisma.assignment.findUnique({ where: { id } });
  if (!cur) return null;
  return prisma.assignment.update({ where: { id }, data });
}

// DELETES AN ASSIGNMENT AND RETURNS THE NUMBER OF ROWS REMOVED
async function remove(id) {
  try { await prisma.assignment.delete({ where: { id } }); return 1; }
  catch { return 0; }
}

export const AssignmentsModel = { all, byId, dueBetween, create, update, remove };