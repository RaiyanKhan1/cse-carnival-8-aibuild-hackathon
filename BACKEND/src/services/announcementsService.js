import { AnnouncementsModel } from '../models/announcementsModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { isDate } from '../utils/time.js';
import { nextId } from '../utils/idGenerator.js';

const PRIORITIES = ['high', 'medium', 'low'];

// RETURNS ALL ANNOUNCEMENTS
async function list() { return AnnouncementsModel.all(); }

// RETURNS ONE ANNOUNCEMENT BY ID OR THROWS NOT_FOUND
async function get(id) {
  const row = await AnnouncementsModel.byId(id);
  if (!row) throw NotFound();
  return row;
}

// VALIDATES INPUT AND CREATES A NEW ANNOUNCEMENT WITH AN AUTO ID
async function create(data) {
  const required = ['title', 'date', 'priority'];
  for (const f of required) if (!data?.[f]) throw BadRequest(`MISSING_FIELD:${f}`);
  if (!isDate(data.date)) throw BadRequest('INVALID_DATE');
  if (!PRIORITIES.includes(data.priority)) throw BadRequest('INVALID_PRIORITY');
  if (data.expires && !isDate(data.expires)) throw BadRequest('INVALID_EXPIRES');
  const id = data.id || await nextId('ann', 'announcement');
  return AnnouncementsModel.create({ ...data, id });
}

// VALIDATES PATCH FIELDS AND UPDATES AN ANNOUNCEMENT
async function update(id, data) {
  if (data.priority && !PRIORITIES.includes(data.priority)) throw BadRequest('INVALID_PRIORITY');
  if (data.date && !isDate(data.date)) throw BadRequest('INVALID_DATE');
  if (data.expires && !isDate(data.expires)) throw BadRequest('INVALID_EXPIRES');
  const row = await AnnouncementsModel.update(id, data);
  if (!row) throw NotFound();
  return row;
}

// DELETES AN ANNOUNCEMENT OR THROWS NOT_FOUND
async function remove(id) {
  if ((await AnnouncementsModel.remove(id)) === 0) throw NotFound();
  return { ok: true };
}

export const AnnouncementsService = { list, get, create, update, remove };