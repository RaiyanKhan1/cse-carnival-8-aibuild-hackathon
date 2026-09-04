import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { AssignmentsService } from '../services/assignmentsService.js';

export const getAllAssignments = asyncHandler(async (_req, res) => {
  SuccessHandler(await AssignmentsService.list(), res, 200, 'Assignments fetched successfully');
});

export const getDueThisWeek = asyncHandler(async (_req, res) => {
  SuccessHandler(await AssignmentsService.dueThisWeek(), res, 200, 'Due-this-week assignments fetched successfully');
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.get(req.params.id), res, 200, 'Assignment fetched successfully');
});

export const createAssignment = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.create(req.body), res, 201, 'Assignment created successfully');
});

export const updateAssignment = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.update(req.params.id, req.body), res, 200, 'Assignment updated successfully');
});

export const deleteAssignment = asyncHandler(async (_req, res) => {
  SuccessHandler({ ok: true }, res, 200, 'Assignment deleted successfully');
});