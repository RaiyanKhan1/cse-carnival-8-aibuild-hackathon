import { Router } from 'express';
import * as ctrl from '../controllers/announcementsController.js';

const router = Router();

router.get('/', ctrl.getAllAnnouncements);
router.get('/:id', ctrl.getAnnouncementById);
router.post('/', ctrl.createAnnouncement);
router.put('/:id', ctrl.updateAnnouncement);
router.delete('/:id', ctrl.deleteAnnouncement);

export default router;