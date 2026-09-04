import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { SchedulesService } from '../services/schedulesService.js';

export const getAllSchedules = asyncHandler(async (_req, res) => {
  const data = await SchedulesService.list();
  SuccessHandler(data, res, 200, 'Schedules fetched successfully');
});

export const getScheduleById = asyncHandler(async (req, res) => {
  const data = await SchedulesService.get(req.params.id);
  SuccessHandler(data, res, 200, 'Schedule fetched successfully');
});

export const createSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.create(req.body);
  SuccessHandler(data, res, 201, 'Schedule created successfully');
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.update(req.params.id, req.body);
  SuccessHandler(data, res, 200, 'Schedule updated successfully');
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.remove(req.params.id);
  SuccessHandler(data, res, 200, 'Schedule deleted successfully');
});