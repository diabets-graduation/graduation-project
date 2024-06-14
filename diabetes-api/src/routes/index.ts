import express, { Router, Request, Response } from 'express';
import { welcomeMessage, notFound } from '../controllers/'
import { join } from 'path'
import { userRouter } from './api/userRouter'
import { authRouter } from './api/authRouter'

//Declareing Static Directory for Serving Static Files

const staticDir: string = join(__dirname, '..', '..', 'public')

//Creatring Router instance

const router: Router = express.Router()

// Useing Static Directory for Serving Static Files

router.use('/static', express.static(staticDir))

// Welcome Message With / EndPoint

/*router.get('/', (req: Request, res: Response) => {
    res.redirect('static/home.html');
  });
*/
router.get('/', welcomeMessage);
//user user router
router.use('/users', userRouter)

//user auth router
router.use('/auth', authRouter)


// Response With Not Found for any invalid path

router.all('/*', notFound)

export default router
