import { Router } from 'express';
import * as ctrl from '../controllers/agentController.js';

// REGISTERS THE AI AGENT ROUTES
const router = Router();

router.get('/status', ctrl.status);
router.post('/', ctrl.ask);

export default router;
