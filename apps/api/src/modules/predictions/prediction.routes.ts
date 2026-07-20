import { Router } from 'express';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { PredictionRepository } from './prediction.repository';
import { authenticateJWT } from '../auth/auth.middleware';
import { predictionQuerySchema } from './prediction.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new PredictionRepository();
const service = new PredictionService(repo);
const controller = new PredictionController(service);

router.use(authenticateJWT);

router.get('/', validate(predictionQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);

export default router;
