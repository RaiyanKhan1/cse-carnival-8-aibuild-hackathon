import { SchedulesModel } from '../models/schedulesModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { DAYS, isTime } from '../utils/time.js';
import { nextId } from '../utils/idGenerator.js';

// RETURNS ALL SCHEDULE ENTRIES
async function list() { return SchedulesModel.all(); }

// RETURNS ONE SCHEDULE ENTRY OR THROWS NOT_FOUND
async function get(id) {
  const row = await SchedulesModel.byId(id);
  if (!row) throw NotFound();
  return row;
}

// VALIDATES INPUT AND CREATES A NEW SCHEDULE ENTRY WITH AN AUTO ID
async function create(data) {
  const required = ['course', 'day', 'start_time', 'end_time', 'room'];
  for (const f of required) if (!data?.[f]) throw BadRequest(`MISSING_FIELD:${f}`);
  if (!DAYS.includes(data.day)) throw BadRequest('INVALID_DAY');
  if (!isTime(data.start_time) || !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
  const id = data.id || await nextId('sch', 'schedule');
  return SchedulesModel.create({ ...data, id });
}

// VALIDATES PATCH FIELDS AND UPDATES A SCHEDULE ENTRY
async function update(id, data) {
  if (data.day && !DAYS.includes(data.day)) throw BadRequest('INVALID_DAY');
  if (data.start_time && !isTime(data.start_time)) throw BadRequest('INVALID_TIME');
  if (data.end_time && !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
  const row = await SchedulesModel.update(id, data);
  if (!row) throw NotFound();
  return row;
}

// DELETES A SCHEDULE ENTRY OR THROWS NOT_FOUND
async function remove(id) {
  if ((await SchedulesModel.remove(id)) === 0) throw NotFound();
  return { ok: true };
}

export const SchedulesService = { list, get, create, update, remove };