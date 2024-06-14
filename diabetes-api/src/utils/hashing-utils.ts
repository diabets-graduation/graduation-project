import { compareSync, hashSync } from 'bcrypt'
import { SALT_ROUND, BCRYPT_PASSWORD } from '../config'

const passwordHashing = (password: string): string => {
  const password_plus_pepper = password.concat(BCRYPT_PASSWORD as string)
  return hashSync(password_plus_pepper, parseInt(SALT_ROUND as string))
}
const isValidPassword = (password: string, hashedPassword: string): boolean => {
  const password_plus_pepper = password.concat(BCRYPT_PASSWORD as string)
  return compareSync(password_plus_pepper, hashedPassword)
}

export { passwordHashing, isValidPassword }
