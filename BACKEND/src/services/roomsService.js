import { RoomsModel } from '../models/roomsModel.js';
import { BadRequest, NotFound, Conflict } from '../components/errors.js';
import { isTime, isDate } from '../utils/time.js';
import { nextId, nextBookingId } from '../utils/idGenerator.js';

export const RoomsService = {
  async list() { return RoomsModel.all(); },

  async get(id) {
    const row = await RoomsModel.byId(id);
    if (!row) throw NotFound();
    return row;
  },

  async create(data) {
    if (!data?.room_number || !data?.type) throw BadRequest('MISSING_FIELDS');
    const id = data.id || await nextId('room', 'room');
    return RoomsModel.create({ ...data, id });
  },

  async update(id, data) {
    const row = await RoomsModel.update(id, data);
    if (!row) throw NotFound();
    return row;
  },

  async remove(id) {
    if ((await RoomsModel.remove(id)) === 0) throw NotFound();
    return { ok: true };
  },

  async book(roomId, booking) {
    if (!booking?.booked_by) throw BadRequest('MISSING_FIELDS');
    if (!isDate(booking.date)) throw BadRequest('INVALID_DATE');
    if (!isTime(booking.start_time) || !isTime(booking.end_time)) throw BadRequest('INVALID_TIME');
    if (booking.start_time >= booking.end_time) throw BadRequest('INVALID_RANGE');
    if (!(await RoomsModel.byId(roomId))) throw NotFound();
    if (await RoomsModel.hasOverlap(roomId, booking.date, booking.start_time, booking.end_time)) {
      throw Conflict();
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