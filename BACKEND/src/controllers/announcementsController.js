import { asyncHandler } from '../components/asyncHandler.js';
import { AnnouncementsService } from '../services/announcementsService.js';

export const getAllAnnouncements = asyncHandler(async (_req, res) => {
  res.json(await AnnouncementsService.list());
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  res.json(await AnnouncementsService.get(req.params.id));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  res.status(201).json(await AnnouncementsService.create(req.body));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  res.json(await AnnouncementsService.update(req.params.id, req.body));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  res.json(await AnnouncementsService.remove(req.params.id));
});