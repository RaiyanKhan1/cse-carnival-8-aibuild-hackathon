import { Router } from 'express';
import * as ctrl from '../controllers/schedulesController.js';

// REGISTERS THE SCHEDULE CRUD ROUTES
const router = Router();

router.get('/', ctrl.getAllSchedules);
router.get('/:id', ctrl.getScheduleById);
router.post('/', ctrl.createSchedule);
router.put('/:id', ctrl.updateSchedule);
router.delete('/:id', ctrl.deleteSchedule);

export default router;