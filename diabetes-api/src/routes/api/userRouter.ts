import { Router } from 'express'
import {
  getAllUsers,
  getUserById,
  UserCanPregnancy,
  updateForPredict,
  updateUserPassword,
  updateUser,
  deleteUser
} from '../../handlers/user.handler'
import { predictDiabetes } from '../../handlers/predicate.handler'
import validateTokenMiddleware from '../../middlewares/authentication.middleware'
import { CreateRecommendation } from '../../handlers/recommendation.handler'

const userRouter: Router = Router()

userRouter.get('/', validateTokenMiddleware, getAllUsers)
userRouter.get('/profile', validateTokenMiddleware, getUserById)
userRouter.get('/UserPregnancy', validateTokenMiddleware, UserCanPregnancy)
userRouter.put('/updateForPredict', validateTokenMiddleware, updateForPredict)
userRouter.put('/update', validateTokenMiddleware, updateUser)
userRouter.put('/updatePassword', validateTokenMiddleware, updateUserPassword)
userRouter.post('/predict', validateTokenMiddleware, predictDiabetes)
userRouter.post('/recommend',validateTokenMiddleware, CreateRecommendation)
userRouter.delete('/', validateTokenMiddleware, deleteUser)

export { userRouter }
