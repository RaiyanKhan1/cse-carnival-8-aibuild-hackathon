import { EventsModel } from '../models/eventsModel.js';
import { BadRequest, NotFound, Conflict } from '../components/errors.js';
import { isTime, isDate } from '../utils/time.js';
import { nextId } from '../utils/idGenerator.js';

const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled', 'full'];

export const EventsService = {
  async list() { return EventsModel.all(); },

  async get(id) {
    const row = await EventsModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    const required = ['name', 'date', 'start_time', 'end_time', 'end_date', 'capacity'];
    for (const f of required) if (data?.[f] === undefined || data?.[f] === null) throw BadRequest(`MISSING_FIELD:${f}`);
    if (!isDate(data.date) || !isDate(data.end_date)) throw BadRequest('INVALID_DATE');
    if (!isTime(data.start_time) || !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (typeof data.capacity !== 'number' || data.capacity < 0) throw BadRequest('INVALID_CAPACITY');
    const id = data.id || await nextId('evt', 'event');
    const { registrations: _r, ...rest } = data;
    return EventsModel.create({
      ...rest,
      id,
      registered: rest.registered ?? 0,
      status: rest.status ?? 'upcoming',
    });
  },

  async update(id, data) {
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (data.capacity !== undefined && (typeof data.capacity !== 'number' || data.capacity < 0)) {
      throw BadRequest('INVALID_CAPACITY');
    }
    if (data.date && !isDate(data.date)) throw BadRequest('INVALID_DATE');
    if (data.end_date && !isDate(data.end_date)) throw BadRequest('INVALID_DATE');
    if (data.start_time && !isTime(data.start_time)) throw BadRequest('INVALID_TIME');
    if (data.end_time && !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
    const row = await EventsModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await EventsModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },

  async register(eventId, student) {
    if (!student?.student_id || !student?.name) throw BadRequest('MISSING_FIELDS');
    const r = await EventsModel.register(eventId, student);
    if (r.error === 'not_found') throw NotFound();
    if (r.error === 'already_registered') throw Conflict('ALREADY_REGISTERED');
    if (r.error === 'full') throw Conflict('FULL');
    return r.event;
  },

  async unregister(eventId, studentId) {
    const r = await EventsModel.unregister(eventId, studentId);
    if (r.error) throw NotFound();
    return r.event;
  },
};