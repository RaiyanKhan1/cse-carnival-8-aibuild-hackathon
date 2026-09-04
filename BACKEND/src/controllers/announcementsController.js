import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { AnnouncementsService } from '../services/announcementsService.js';

// RETURNS ALL ANNOUNCEMENT RECORDS
export const getAllAnnouncements = asyncHandler(async (_req, res) => {
  SuccessHandler(await AnnouncementsService.list(), res, 200, 'Announcements fetched successfully');
});

// RETURNS ONE ANNOUNCEMENT BY ID
export const getAnnouncementById = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.get(req.params.id), res, 200, 'Announcement fetched successfully');
});

// CREATES A NEW ANNOUNCEMENT
export const createAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.create(req.body), res, 201, 'Announcement created successfully');
});

// UPDATES AN EXISTING ANNOUNCEMENT
export const updateAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.update(req.params.id, req.body), res, 200, 'Announcement updated successfully');
});

// DELETES AN ANNOUNCEMENT BY ID
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  SuccessHandler(await AnnouncementsService.remove(req.params.id), res, 200, 'Announcement deleted successfully');
});