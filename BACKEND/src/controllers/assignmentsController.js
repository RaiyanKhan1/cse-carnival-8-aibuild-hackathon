import { asyncHandler } from '../components/asyncHandler.js';
import { AssignmentsService } from '../services/assignmentsService.js';

export const getAllAssignments = asyncHandler(async (_req, res) => {
  res.json(await AssignmentsService.list());
});

export const getDueThisWeek = asyncHandler(async (_req, res) => {
  res.json(await AssignmentsService.dueThisWeek());
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  res.json(await AssignmentsService.get(req.params.id));
});

export const createAssignment = asyncHandler(async (req, res) => {
  res.status(201).json(await AssignmentsService.create(req.body));
});

export const updateAssignment = asyncHandler(async (req, res) => {
  res.json(await AssignmentsService.update(req.params.id, req.body));
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  res.json(await AssignmentsService.remove(req.params.id));
});