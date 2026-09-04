import { SchedulesModel } from '../models/schedulesModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { DAYS, isTime } from '../utils/time.js';
import { nextId } from '../utils/idGenerator.js';

export const SchedulesService = {
  async list() { return SchedulesModel.all(); },

  async get(id) {
    const row = await SchedulesModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    if (!data?.course || !data?.room) throw BadRequest('MISSING_FIELDS');
    if (!DAYS.includes(data.day)) throw BadRequest('INVALID_DAY');
    if (!isTime(data.start_time) || !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
    const id = data.id || await nextId('sch', 'schedule');
    return SchedulesModel.create({ ...data, id });
  },

  async update(id, data) {
    if (data.day && !DAYS.includes(data.day)) throw BadRequest('INVALID_DAY');
    if (data.start_time && !isTime(data.start_time)) throw BadRequest('INVALID_TIME');
    if (data.end_time && !isTime(data.end_time)) throw BadRequest('INVALID_TIME');
    const row = await SchedulesModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await SchedulesModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },
};