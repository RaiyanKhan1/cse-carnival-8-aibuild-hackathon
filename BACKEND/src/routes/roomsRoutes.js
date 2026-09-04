import { Router } from 'express';
import * as ctrl from '../controllers/roomsController.js';

const router = Router();

router.get('/', ctrl.getAllRooms);
router.get('/available', ctrl.getAvailableRooms);
router.get('/:id', ctrl.getRoomById);
router.post('/', ctrl.createRoom);
router.put('/:id', ctrl.updateRoom);
router.delete('/:id', ctrl.deleteRoom);

router.post('/:id/bookings', ctrl.bookRoom);
router.delete('/:id/bookings/:bookingId', ctrl.cancelBooking);

export default router;