import { config } from 'dotenv'
import { env } from 'process'

config()

//const {NODE_ENV}=env

const {
  /* POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_DB_TEST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  */
  RECOMENDATION_AI_URL,
  NODE_ENV,
  DATABASE_URL,
  SALT_ROUND,
  BCRYPT_PASSWORD,
  TOKEN_SECRET
} = env

//const DB_ENV = NODE_ENV === 'test'?POSTGRES_DB_TEST:POSTGRES_DB
export {
  /*DB_ENV,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    */
  RECOMENDATION_AI_URL,
  NODE_ENV,
  DATABASE_URL,
  SALT_ROUND,
  BCRYPT_PASSWORD,
  TOKEN_SECRET
}
