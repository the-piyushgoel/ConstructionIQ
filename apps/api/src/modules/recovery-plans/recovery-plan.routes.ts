import { Router } from 'express';
import { RecoveryPlanController } from './recovery-plan.controller';
import { RecoveryPlanService } from './recovery-plan.service';
import { RecoveryPlanRepository } from './recovery-plan.repository';
import { authenticateJWT } from '../auth/auth.middleware';
import { recoveryPlanQuerySchema } from './recovery-plan.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new RecoveryPlanRepository();
const service = new RecoveryPlanService(repo);
const controller = new RecoveryPlanController(service);

router.use(authenticateJWT);

router.get('/', validate(recoveryPlanQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);

export default router;
