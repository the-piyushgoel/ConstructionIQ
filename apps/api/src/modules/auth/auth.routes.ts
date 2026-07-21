import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { authenticateJWT } from './auth.middleware';
import { loginSchema, refreshSchema, registerSchema } from './auth.validator';
import { validate } from '../../middleware/validate';

const router = Router();
const repo = new AuthRepository();
const service = new AuthService(repo);
const controller = new AuthController(service);

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', authenticateJWT, controller.logout);
router.get('/me', authenticateJWT, controller.me);

export default router;
