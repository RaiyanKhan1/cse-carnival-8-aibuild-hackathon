import { asyncHandler } from '../components/asyncHandler.js';
import { EventsService } from '../services/eventsService.js';

export const getAllEvents = asyncHandler(async (_req, res) => {
  res.json(await EventsService.list());
});

export const getEventById = asyncHandler(async (req, res) => {
  res.json(await EventsService.get(req.params.id));
});

export const createEvent = asyncHandler(async (req, res) => {
  res.status(201).json(await EventsService.create(req.body));
});

export const updateEvent = asyncHandler(async (req, res) => {
  res.json(await EventsService.update(req.params.id, req.body));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  res.json(await EventsService.remove(req.params.id));
});

export const registerForEvent = asyncHandler(async (req, res) => {
  res.status(201).json(await EventsService.register(req.params.id, req.body));
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {
  res.json(await EventsService.unregister(req.params.id, req.params.studentId));
});