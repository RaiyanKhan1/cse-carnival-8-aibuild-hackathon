import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { EventsService } from '../services/eventsService.js';

// RETURNS ALL EVENT RECORDS WITH REGISTRATIONS
export const getAllEvents = asyncHandler(async (_req, res) => {
  SuccessHandler(await EventsService.list(), res, 200, 'Events fetched successfully');
});

// RETURNS ONE EVENT BY ID
export const getEventById = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.get(req.params.id), res, 200, 'Event fetched successfully');
});

// CREATES A NEW EVENT
export const createEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.create(req.body), res, 201, 'Event created successfully');
});

// UPDATES AN EXISTING EVENT
export const updateEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.update(req.params.id, req.body), res, 200, 'Event updated successfully');
});

// DELETES AN EVENT BY ID
export const deleteEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.remove(req.params.id), res, 200, 'Event deleted successfully');
});

// REGISTERS A STUDENT FOR AN EVENT
export const registerForEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.register(req.params.id, req.body), res, 201, 'Registered for event successfully');
});

// REMOVES A STUDENT REGISTRATION FROM AN EVENT
export const unregisterFromEvent = asyncHandler(async (req, res) => {
  SuccessHandler(await EventsService.unregister(req.params.id, req.params.studentId), res, 200, 'Unregistered from event successfully');
});