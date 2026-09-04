import { AssignmentsModel } from '../models/assignmentsModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { isoDate, plusDays } from '../utils/time.js';
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
    if (!data?.title || !data?.deadline || !data?.course) throw BadRequest('MISSING_FIELDS');
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    const id = data.id || await nextId('asgn', 'assignment');
    return AssignmentsModel.create({ ...data, id, marks: data.marks ?? 0 });
  },

  async update(id, data) {
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
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