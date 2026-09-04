import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { RoomsService } from '../services/roomsService.js';

// RETURNS ALL ROOM RECORDS WITH BOOKINGS
export const getAllRooms = asyncHandler(async (_req, res) => {
  SuccessHandler(await RoomsService.list(), res, 200, 'Rooms fetched successfully');
});

// RETURNS ROOMS MATCHING AVAILABILITY, CAPACITY, AND EQUIPMENT FILTERS
export const getAvailableRooms = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.findAvailable(req.query), res, 200, 'Available rooms fetched successfully');
});

// RETURNS ONE ROOM BY ID
export const getRoomById = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.get(req.params.id), res, 200, 'Room fetched successfully');
});

// CREATES A NEW ROOM
export const createRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.create(req.body), res, 201, 'Room created successfully');
});

// UPDATES AN EXISTING ROOM
export const updateRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.update(req.params.id, req.body), res, 200, 'Room updated successfully');
});

// DELETES A ROOM BY ID
export const deleteRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.remove(req.params.id), res, 200, 'Room deleted successfully');
});

// BOOKS A ROOM FOR A DATE AND TIME WINDOW
export const bookRoom = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.book(req.params.id, req.body), res, 201, 'Room booked successfully');
});

// CANCELS AN EXISTING BOOKING ON A ROOM
export const cancelBooking = asyncHandler(async (req, res) => {
  SuccessHandler(await RoomsService.cancel(req.params.id, req.params.bookingId), res, 200, 'Booking cancelled successfully');
});