import { asyncHandler } from '../components/asyncHandler.js';
import { SchedulesService } from '../services/schedulesService.js';

export const getAllSchedules = asyncHandler(async (_req, res) => {
  res.json(await SchedulesService.list());
});

export const getScheduleById = asyncHandler(async (req, res) => {
  res.json(await SchedulesService.get(req.params.id));
});

export const createSchedule = asyncHandler(async (req, res) => {
  res.status(201).json(await SchedulesService.create(req.body));
});

export const updateSchedule = asyncHandler(async (req, res) => {
  res.json(await SchedulesService.update(req.params.id, req.body));
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  res.json(await SchedulesService.remove(req.params.id));
});