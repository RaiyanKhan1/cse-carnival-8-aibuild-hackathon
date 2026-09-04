import { Router } from 'express';
import * as ctrl from '../controllers/assignmentsController.js';

const router = Router();

router.get('/', ctrl.getAllAssignments);
router.get('/this-week', ctrl.getDueThisWeek);
router.get('/:id', ctrl.getAssignmentById);
router.post('/', ctrl.createAssignment);
router.put('/:id', ctrl.updateAssignment);
router.delete('/:id', ctrl.deleteAssignment);

export default router;