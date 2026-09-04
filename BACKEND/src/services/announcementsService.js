import { AnnouncementsModel } from '../models/announcementsModel.js';
import { BadRequest, NotFound } from '../components/errors.js';
import { nextId } from '../utils/idGenerator.js';

const PRIORITIES = ['high', 'medium', 'low'];

export const AnnouncementsService = {
  async list() { return AnnouncementsModel.all(); },

  async get(id) {
    const row = await AnnouncementsModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    if (!data?.title) throw BadRequest('MISSING_FIELDS');
    if (data.priority && !PRIORITIES.includes(data.priority)) throw BadRequest('INVALID_PRIORITY');
    const id = data.id || await nextId('ann', 'announcement');
    return AnnouncementsModel.create({ ...data, id });
  },

  async update(id, data) {
    if (data.priority && !PRIORITIES.includes(data.priority)) throw BadRequest('INVALID_PRIORITY');
    const row = await AnnouncementsModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await AnnouncementsModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },
};