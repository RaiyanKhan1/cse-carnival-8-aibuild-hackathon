import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { RoomsService } from '../services/roomsService.js';

export const getAllRooms = asyncHandler(async (_req, res) => {
  SuccessHandler(await RoomsService.list(), res, 200, 'Rooms fetched successfully');
});

export const getAvailableRooms = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.findAvailable(req.query), res, 200, 'Available rooms fetched successfully');
});

export const getRoomById = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.get(req.params.id), res, 200, 'Room fetched successfully');
});

export const createRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.create(req.body), res, 201, 'Room created successfully');
});

export const updateRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.update(req.params.id, req.body), res, 200, 'Room updated successfully');
});

export const deleteRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.remove(req.params.id), res, 200, 'Room deleted successfully');
});

export const bookRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.book(req.params.id, req.body), res, 201, 'Room booked successfully');
});

export const cancelBooking = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.cancel(req.params.id, req.params.bookingId), res, 200, 'Booking cancelled successfully');
});