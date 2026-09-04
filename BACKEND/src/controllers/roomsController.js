import { asyncHandler } from '../components/asyncHandler.js';
import { RoomsService } from '../services/roomsService.js';

export const getAllRooms = asyncHandler(async (_req, res) => {
  res.json(await RoomsService.list());
});

export const getAvailableRooms = asyncHandler(async (req, res) => {
  res.json(await RoomsService.findAvailable(req.query));
});

export const getRoomById = asyncHandler(async (req, res) => {
  res.json(await RoomsService.get(req.params.id));
});

export const createRoom = asyncHandler(async (req, res) => {
  res.status(201).json(await RoomsService.create(req.body));
});

export const updateRoom = asyncHandler(async (req, res) => {
  res.json(await RoomsService.update(req.params.id, req.body));
});

export const deleteRoom = asyncHandler(async (req, res) => {
  res.json(await RoomsService.remove(req.params.id));
});

export const bookRoom = asyncHandler(async (req, res) => {
  res.status(201).json(await RoomsService.book(req.params.id, req.body));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  res.json(await RoomsService.cancel(req.params.id, req.params.bookingId));
});