import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { AnnouncementsService } from '../services/announcementsService.js';

export const getAllAnnouncements = asyncHandler(async (_req, res) => {
  SuccessHandler(await AnnouncementsService.list(), res, 200, 'Announcements fetched successfully');
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.get(req.params.id), res, 200, 'Announcement fetched successfully');
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.create(req.body), res, 201, 'Announcement created successfully');
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.update(req.params.id, req.body), res, 200, 'Announcement updated successfully');
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.remove(req.params.id), res, 200, 'Announcement deleted successfully');
});