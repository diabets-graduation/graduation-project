import { Router } from 'express';
import { userLogin, createUser, userLogout } from '../../handlers/user.handler';
import validateTokenMiddleware from '../../middlewares/authentication.middleware';

const authRouter: Router = Router();

// Signup route
authRouter.post('/signup', createUser);

// Login route
authRouter.post('/login', userLogin);

authRouter.post('/logout', validateTokenMiddleware, userLogout)

export { authRouter };
