import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { EventsService } from '../services/eventsService.js';

export const getAllEvents = asyncHandler(async (_req, res) => {
  SuccessHandler(await EventsService.list(), res, 200, 'Events fetched successfully');
});

export const getEventById = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.get(req.params.id), res, 200, 'Event fetched successfully');
});

export const createEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.create(req.body), res, 201, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.update(req.params.id, req.body), res, 200, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.remove(req.params.id), res, 200, 'Event deleted successfully');
});

export const registerForEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.register(req.params.id, req.body), res, 201, 'Registered for event successfully');
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.unregister(req.params.id, req.params.studentId), res, 200, 'Unregistered from event successfully');
});