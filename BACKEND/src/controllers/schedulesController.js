import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { SchedulesService } from '../services/schedulesService.js';

// RETURNS ALL SCHEDULE ENTRIES
export const getAllSchedules = asyncHandler(async (_req, res) => {
  const data = await SchedulesService.list();
  SuccessHandler(data, res, 200, 'Schedules fetched successfully');
});

// RETURNS ONE SCHEDULE ENTRY BY ID
export const getScheduleById = asyncHandler(async (req, res) => {
  const data = await SchedulesService.get(req.params.id);
  SuccessHandler(data, res, 200, 'Schedule fetched successfully');
});

// CREATES A NEW SCHEDULE ENTRY
export const createSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.create(req.body);
  SuccessHandler(data, res, 201, 'Schedule created successfully');
});

// UPDATES AN EXISTING SCHEDULE ENTRY
export const updateSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.update(req.params.id, req.body);
  SuccessHandler(data, res, 200, 'Schedule updated successfully');
});

// DELETES A SCHEDULE ENTRY BY ID
export const deleteSchedule = asyncHandler(async (req, res) => {
  const data = await SchedulesService.remove(req.params.id);
  SuccessHandler(data, res, 200, 'Schedule deleted successfully');
});