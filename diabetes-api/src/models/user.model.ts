import { Client } from '../database/database';
import { User, UserData } from '../types/UserTypes';
import { isValidPassword, passwordHashing } from '../utils/hashing-utils';

class UserModel {
  async index(): Promise<User[]> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `SELECT user_id, name, phone, email, Blood_Pressure, pregnancies, glucose, skin_thickness, Insulin, BMI, DiabetesPedigreeFunction, age, has_diabetes FROM users;`;
      const queryResult = await connection.query(sqlQuery);
      connection.release();
      return queryResult.rows;
    } catch (error) {
      throw new Error(`Error while getting all users: ${error}`);
    }
  }

  async show(user_id: string): Promise<User> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `SELECT * FROM users WHERE user_id = $1;`;
      const queryResult = await connection.query(sqlQuery, [user_id]);
      connection.release();
      const user = queryResult.rows[0];
      user.bmi = parseFloat(user.bmi);
      user.diabetespedigreefunction = parseFloat(user.diabetespedigreefunction);
  
      return user;
    } catch (error) {
      throw new Error(`Error while getting user: ${error}`);
    }
  }

  async findOne(email: string): Promise<User> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `SELECT * FROM users WHERE email = $1;`;
      const queryResult = await connection.query(sqlQuery, [email]);
      connection.release();
      return queryResult.rows[0];
    } catch (error) {
      throw new Error(`Error while getting user: ${error}`);
    }
  }

  async getUserPassword(user_id: string): Promise<string> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `
        SELECT password 
        FROM users 
        WHERE user_id = $1;
      `;
      const queryResult = await connection.query(sqlQuery, [user_id]);
      connection.release();
      return queryResult.rows[0].password;
    } catch (error) {
      throw new Error(`Error while fetching user password: ${error}`);
    }
  }

  async createUser(user: User): Promise<User> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `INSERT INTO users (name, phone, email, password, date_of_birth, age, can_pregnancy, is_female, height, weight, bmi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
      const hashedPassword = await passwordHashing(user.password);
      const queryResult = await connection.query(sqlQuery, [
        user.name,
        user.phone,
        user.email,
        hashedPassword,
        user.date_of_birth,
        user.age,
        user.can_pregnancy,
        user.is_female,
        user.height,
        user.weight,
        user.bmi,
      ]);
      connection.release();
      return queryResult.rows[0];
    } catch (error) {
      throw new Error(`Error while creating user: ${error}`);
    }
  }

//update user profile
async updateUserData(user: User): Promise<User> {
  try {
    const connection = await Client.connect();
    const sqlQuery = `
      UPDATE users 
      SET name = $2, email = $3, phone = $4, height = $5, weight = $6, bmi = $7 
      WHERE user_id = $1 
      RETURNING *;
    `;
    const queryResult = await connection.query(sqlQuery, [
      user.user_id,
      user.name,
      user.email,
      user.phone,
      user.height,
      user.weight,
      user.bmi
    ]);
    connection.release();
    return queryResult.rows[0];
  } catch (error) {
    throw new Error(`Error while updating user: ${error}`);
  }
}

// update user password 

async updatePassword (user_id: string, newPassword: string): Promise<User> {

  try {

    const connection = await Client.connect();
    const hashedPassword = await passwordHashing(newPassword);
    const sqlQuery = `
    UPDATE users 
    SET password = $2 
    WHERE user_id = $1 
    RETURNING *;
  `;
  const queryResult = await connection.query(sqlQuery, [
    user_id,
    hashedPassword
  ]);
  connection.release();
  return queryResult.rows[0];
} catch (error) {
  throw new Error(`Error while updating user password: ${error}`);
}
}

 // Update diabetes_info
 async updateDiabetesInfo(user_id: string, diabetes_info: string): Promise<User> {
  try {
    const connection = await Client.connect();
    const sqlQuery = `UPDATE users SET diabetes_info = $2 WHERE user_id = $1 RETURNING *;`;
    const queryResult = await connection.query(sqlQuery, [user_id, diabetes_info]);
    connection.release();
    return queryResult.rows[0];
  } catch (error) {
    throw new Error(`Error while updating diabetes_info: ${error}`);
  }
}

  async updateUserDataForPredict(user: User): Promise<User> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `UPDATE users SET  blood_pressure = $2, pregnancies = $3, glucose = $4, skin_thickness = $5, insulin = $6, bmi = $7, diabetespedigreefunction = $8, age = $9, has_diabetes = $10,recommendation_id=$11 WHERE user_id = $1 RETURNING *;`;
      const queryResult = await connection.query(sqlQuery, [
        user.user_id,
        user.blood_pressure,
        user.pregnancies,
        user.glucose,
        user.skin_thickness,
        user.insulin,
        user.bmi,
        user.diabetespedigreefunction,
        user.age,
        user.has_diabetes,
        user.recommendation_id
      ]);
      connection.release();
      return queryResult.rows[0];
    } catch (error) {
      throw new Error(`Error while updating user: ${error}`);
    }
  }
  
  async delete(user_id: string): Promise<User> {
    try {
      const connection = await Client.connect();
      const sqlQuery = `DELETE FROM users WHERE user_id = $1 RETURNING *;`;
      const queryResult = await connection.query(sqlQuery, [user_id]);
      connection.release();
      return queryResult.rows[0];
    } catch (error) {
      throw new Error(`Error while deleting user: ${error}`);
    }
  }

  async authenticate(email: string, password: string): Promise<string | false> {
    try {
      const connection = await Client.connect();
      const sqlQuery = 'SELECT password FROM users WHERE email = $1;';
      const queryResult = await connection.query(sqlQuery, [email]);
      if (isValidPassword(password, queryResult.rows[0].password as string)) {
        const result = await connection.query(`SELECT user_id FROM users WHERE email = $1;`, [email]);
        connection.release();
        return result.rows[0].user_id;
      }
      return false;
    } catch (error) {
      throw new Error(`Error while user login: ${error}`);
    }
  }
}

export { UserModel };