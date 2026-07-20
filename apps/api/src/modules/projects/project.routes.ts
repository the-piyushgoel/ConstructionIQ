import { Router } from 'express';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { authenticateJWT, requireRole } from '../auth/auth.middleware';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from './project.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new ProjectRepository();
const service = new ProjectService(repo);
const controller = new ProjectController(service);

router.use(authenticateJWT);

router.post('/', requireRole(['ADMIN', 'PM']), validate(createProjectSchema), controller.create);
router.get('/', validate(projectQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id', requireRole(['ADMIN', 'PM']), validate(updateProjectSchema), controller.update);
router.delete('/:id', requireRole(['ADMIN', 'PM']), controller.delete);

export default router;
