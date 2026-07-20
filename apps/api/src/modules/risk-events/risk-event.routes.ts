import { Router } from 'express';
import { RiskEventController } from './risk-event.controller';
import { RiskEventService } from './risk-event.service';
import { RiskEventRepository } from './risk-event.repository';
import { authenticateJWT, requireRole } from '../auth/auth.middleware';
import { createRiskEventSchema, updateRiskEventSchema, riskEventQuerySchema } from './risk-event.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new RiskEventRepository();
const service = new RiskEventService(repo);
const controller = new RiskEventController(service);

router.use(authenticateJWT);

router.post('/', requireRole(['ADMIN', 'PM']), validate(createRiskEventSchema), controller.create);
router.get('/', validate(riskEventQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id', requireRole(['ADMIN', 'PM']), validate(updateRiskEventSchema), controller.update);
router.delete('/:id', requireRole(['ADMIN', 'PM']), controller.delete);

export default router;
