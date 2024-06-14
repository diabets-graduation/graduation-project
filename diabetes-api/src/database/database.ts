import { Pool } from 'pg'
import { DATABASE_URL } from '../config'

const Client = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
  /*
    database: DB_ENV,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD as string,
    port: parseInt(POSTGRES_PORT as string),
    host: POSTGRES_HOST
    */
})

//test connection to database
const test_db_connection = async (): Promise<void> => {
  try {
    const connection = await Client.connect()
    const sqlQuery = 'select now();'
    const result = await connection.query(sqlQuery)
    console.log(`Database Connected ${result.rows[0].now}`)
    connection.release()
  } catch (error) {
    console.error(error)
  }
}

export { Client, test_db_connection }
