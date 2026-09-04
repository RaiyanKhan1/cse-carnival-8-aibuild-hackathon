import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { AssignmentsService } from '../services/assignmentsService.js';

// RETURNS ALL ASSIGNMENT RECORDS
export const getAllAssignments = asyncHandler(async (_req, res) => {
  SuccessHandler(await AssignmentsService.list(), res, 200, 'Assignments fetched successfully');
});

// RETURNS ASSIGNMENTS DUE WITHIN THE NEXT SEVEN DAYS
export const getDueThisWeek = asyncHandler(async (_req, res) => {
  SuccessHandler(await AssignmentsService.dueThisWeek(), res, 200, 'Due-this-week assignments fetched successfully');
});

// RETURNS ONE ASSIGNMENT BY ID
export const getAssignmentById = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.get(req.params.id), res, 200, 'Assignment fetched successfully');
});

// CREATES A NEW ASSIGNMENT
export const createAssignment = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.create(req.body), res, 201, 'Assignment created successfully');
});

// UPDATES AN EXISTING ASSIGNMENT
export const updateAssignment = asyncHandler(async (req, res) => {
  SuccessHandler(await AssignmentsService.update(req.params.id, req.body), res, 200, 'Assignment updated successfully');
});

// DELETES AN ASSIGNMENT BY ID
export const deleteAssignment = asyncHandler(async (_req, res) => {
  SuccessHandler({ ok: true }, res, 200, 'Assignment deleted successfully');
});