import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/token-utils'

const validateTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers['authorization']

    if (!authorizationHeader) {
      res.status(401).json({ error: 'Token not provided' })
      return
    }

    const jwtToken = authorizationHeader.split(' ')[1]
    const tokenData = verifyToken(jwtToken)
    if (tokenData) {
      req.headers['x-user-id'] = tokenData.user_id
      next()
    } else {
      res.status(401).json({ error: 'Unauthorized Access' })
    }
  } catch (error) {
    return res.status(401).json({ Authentication: 'Failed' })
  }
}

export default validateTokenMiddleware
