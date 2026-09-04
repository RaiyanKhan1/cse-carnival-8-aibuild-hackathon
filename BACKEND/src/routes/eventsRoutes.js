import { Router } from 'express';
import * as ctrl from '../controllers/eventsController.js';

// REGISTERS THE EVENT AND REGISTRATION CRUD ROUTES
const router = Router();

router.get('/', ctrl.getAllEvents);
router.get('/:id', ctrl.getEventById);
router.post('/', ctrl.createEvent);
router.put('/:id', ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

router.post('/:id/register', ctrl.registerForEvent);
router.delete('/:id/register/:studentId', ctrl.unregisterFromEvent);

export default router;