import { sign, verify } from 'jsonwebtoken'
import { Response } from 'express'
import { TOKEN_SECRET } from '../config'

const generateToken = (res: Response, user_id: string): string => {
  const token = sign({ user_id }, TOKEN_SECRET as string, {
    expiresIn: '7d'
  })
  res.header('Authorization', `Bearer ${token}`)
  return token
}

const verifyToken = (token: string): { user_id: string } => {
  return verify(token, TOKEN_SECRET as string) as { user_id: string }
}

const clearToken = (res: Response): void => {
  res.removeHeader('Authorization')
}

export { generateToken, clearToken, verifyToken }
