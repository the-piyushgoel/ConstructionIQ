import { Router } from 'express';
import { DecisionController } from './decision.controller';
import { DecisionService } from './decision.service';
import { DecisionRepository } from './decision.repository';
import { authenticateJWT, requireRole } from '../auth/auth.middleware';
import { decisionQuerySchema, decisionApproveSchema, decisionRejectSchema } from './decision.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new DecisionRepository();
const service = new DecisionService(repo);
const controller = new DecisionController(service);

router.use(authenticateJWT);

router.get('/', validate(decisionQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);

router.post('/:id/approve', requireRole(['ADMIN', 'PM']), validate(decisionApproveSchema), controller.approve);
router.post('/:id/reject', requireRole(['ADMIN', 'PM']), validate(decisionRejectSchema), controller.reject);

export default router;
