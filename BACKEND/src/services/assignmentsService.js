import { AssignmentsModel } from '../models/assignmentsModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { isDate, isoDate, plusDays } from '../utils/time.js';
import { nextId } from '../utils/idGenerator.js';

const STATUSES = ['pending', 'submitted', 'graded', 'late'];

export const AssignmentsService = {
  async list() { return AssignmentsModel.all(); },

  async get(id) {
    const row = await AssignmentsModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    const required = ['course', 'title', 'assigned_date', 'deadline', 'status'];
    for (const f of required) if (!data?.[f]) throw BadRequest(`MISSING_FIELD:${f}`);
    if (!isDate(data.assigned_date) || !isDate(data.deadline)) throw BadRequest('INVALID_DATE');
    if (!STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (data.marks !== undefined && (typeof data.marks !== 'number' || data.marks < 0)) {
      throw BadRequest('INVALID_MARKS');
    }
    const id = data.id || await nextId('asgn', 'assignment');
    return AssignmentsModel.create({ ...data, id, marks: data.marks ?? 0 });
  },

  async update(id, data) {
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (data.assigned_date && !isDate(data.assigned_date)) throw BadRequest('INVALID_DATE');
    if (data.deadline && !isDate(data.deadline)) throw BadRequest('INVALID_DATE');
    if (data.marks !== undefined && (typeof data.marks !== 'number' || data.marks < 0)) {
      throw BadRequest('INVALID_MARKS');
    }
    const row = await AssignmentsModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await AssignmentsModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },

  async dueThisWeek() {
    return AssignmentsModel.dueBetween(isoDate(), plusDays(7));
  },
};