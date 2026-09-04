import { RoomsModel } from '../models/roomsModel.js';
import { BadRequest, NotFound, Conflict } from '../components/errors.js';
import { isTime, isDate } from '../utils/time.js';
import { nextId, nextBookingId } from '../utils/idGenerator.js';

const TYPES = ['classroom', 'lab', 'seminar'];
const STATUSES = ['available', 'unavailable'];

export const RoomsService = {
  async list() { return RoomsModel.all(); },

  async get(id) {
    const row = await RoomsModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    const required = ['room_number', 'type', 'capacity', 'floor', 'status'];
    for (const f of required) if (data?.[f] === undefined || data?.[f] === null) throw BadRequest(`MISSING_FIELD:${f}`);
    if (!TYPES.includes(data.type)) throw BadRequest('INVALID_TYPE');
    if (!STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (typeof data.capacity !== 'number' || data.capacity < 0) throw BadRequest('INVALID_CAPACITY');
    if (data.equipment && !Array.isArray(data.equipment)) throw BadRequest('INVALID_EQUIPMENT');
    const id = data.id || await nextId('room', 'room');
    return RoomsModel.create({ ...data, id, equipment: data.equipment || [] });
  },

  async update(id, data) {
    if (data.type && !TYPES.includes(data.type)) throw BadRequest('INVALID_TYPE');
    if (data.status && !STATUSES.includes(data.status)) throw BadRequest('INVALID_STATUS');
    if (data.capacity !== undefined && (typeof data.capacity !== 'number' || data.capacity < 0)) {
      throw BadRequest('INVALID_CAPACITY');
    }
    if (data.equipment && !Array.isArray(data.equipment)) throw BadRequest('INVALID_EQUIPMENT');
    const row = await RoomsModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await RoomsModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },

  async book(roomId, booking) {
    const required = ['booked_by', 'date', 'start_time', 'end_time'];
    for (const f of required) if (!booking?.[f]) throw BadRequest(`MISSING_FIELD:${f}`);
    if (!isDate(booking.date)) throw BadRequest('INVALID_DATE');
    if (!isTime(booking.start_time) || !isTime(booking.end_time)) throw BadRequest('INVALID_TIME');
    if (booking.start_time >= booking.end_time) throw BadRequest('INVALID_RANGE');
    if (!(await RoomsModel.byId(roomId))) throw NotFound();
    if (await RoomsModel.hasOverlap(roomId, booking.date, booking.start_time, booking.end_time)) {
      throw Conflict('BOOKING_CONFLICT');
    }
    const booking_id = booking.booking_id || await nextBookingId();
    return RoomsModel.addBooking(roomId, { ...booking, booking_id });
  },

  async cancel(roomId, bookingId) {
    if ((await RoomsModel.removeBooking(roomId, bookingId)) === 0) throw NotFound();
    return RoomsModel.byId(roomId);
  },

  async findAvailable({ date, start, end, minCapacity, equipment } = {}) {
    const rooms = (await RoomsModel.all()).filter(r => r.status === 'available');
    const needs = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : []);
    return rooms.filter(r => {
      if (minCapacity && r.capacity < Number(minCapacity)) return false;
      if (needs.length && !needs.every(e => r.equipment.includes(e))) return false;
      if (date && start && end) {
        const clash = (r.bookings || []).some(b =>
          b.date === date && !(b.end_time <= start || b.start_time >= end)
        );
        if (clash) return false;
      }
      return true;
    });
  },
};