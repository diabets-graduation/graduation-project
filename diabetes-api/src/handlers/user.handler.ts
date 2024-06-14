import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { User, UserData } from '../types/UserTypes';
import { clearToken, generateToken } from '../utils/token-utils';
import { CreateRecommendationId,calculateAgeFromDateOfBirth,calculateBMI } from '../utils/users-utils';
import { isValidPassword, passwordHashing } from '../utils/hashing-utils';

const userModel = new UserModel();

// retrieve all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: User[] = await userModel.index();
    if (!users.length) {
      res.status(404).json({ message: 'There are no users to retrieve' });
      return;
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error: 'Error while getting Users' });
  }
};

// retrieve user by user_id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.headers['x-user-id'] as string;
    if (!user_id) {
      res.status(400).json({ message: 'Missing user id' });
      return;
    }
    const user: User = await userModel.show(user_id);
    console.log('USER', user);
    if (!user) {
      res.status(404).json({ message: 'User Not Found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: 'Error while getting User' });
  }
};

// user can_pregnancy ?
export const UserCanPregnancy = async (req:Request, res:Response):Promise<void>=>{
  try {
    const user_id = req.headers['x-user-id'] as string;
    const existingUser = await userModel.show(user_id);

    if (!existingUser) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }

    res.status(200).json({ can_pregnancy: existingUser.can_pregnancy });

  } catch (error) {
    res.status(400).json({ error: 'Error while getting User' });
  }
}


// create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = {
      email: req.body.email as string,
      password: req.body.password as string,
      name: req.body.name as string,
      phone: req.body.phone as string,
      date_of_birth: req.body.date_of_birth as string,
      height: req.body.height as number,
      weight: req.body.weight as number,
      is_female: req.body.is_female as boolean,
    };

    // Check if all required fields are provided
    if (!user.email || !user.password || !user.date_of_birth || !user.height || !user.weight) {
      res.status(400).json({ message: 'Please Provide All Data' });
      return;
    }

    // Check if the email already exists
    const userExists = await userModel.findOne(user.email);
    if (userExists) {
      res.status(400).json({ message: 'The Email already exists' });
      return;
    }

    // Calculate age
    const age = calculateAgeFromDateOfBirth(user.date_of_birth);

    // Calculate BMI
    const bmi = calculateBMI(user.weight, user.height);

    // user pregnancy
    let can_pregnancy = false;
    if (user.is_female && age >= 16 && age <= 60) {
      can_pregnancy = true;
    }

    // Create new user object with calculated age, BMI, and can_pregnancy
    const newUser: User = {
      ...user,
      age,
      bmi,
      can_pregnancy
    };

    // Create the user
    const createdUser = await userModel.createUser(newUser);

    // Send success response
    res.status(201).json({ success: createdUser });
  } catch (err) {
    // Handle errors
    res.status(400).json({ error: 'Error while creating User' });
  }
};

//update user profile

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.headers['x-user-id'] as string;
    const existingUser = await userModel.show(user_id);

    if (!existingUser) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }

    // Calculate BMI
    const bmi = calculateBMI(req.body.weight, req.body.height);

    // Update user data
    const updatedUser: User = {
      ...existingUser,
      name: req.body.name as string,
      email: req.body.email as string,
      phone: req.body.phone as string,
      height: req.body.height as number,
      weight: req.body.weight as number,
      bmi
    };
    console.log(updatedUser)
    const user = await userModel.updateUserData(updatedUser);

    res.status(200).json({ success: user });
  } catch (err) {
    res.status(400).json({ error: 'Error while updating User' });
  }
};


// update user password 
export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.headers['x-user-id'] as string;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Please provide both current and new passwords' });
      return;
    }

    const existingUserPassword = await userModel.getUserPassword(user_id);
    
    const isPasswordValid = await isValidPassword(currentPassword, existingUserPassword);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    const updatedUser = await userModel.updatePassword(user_id, newPassword);
    res.status(200).json({ success: updatedUser });
  } catch (err) {
    res.status(400).json({ error: 'Error while updating user password' });
  }
};

/*
// update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.headers['x-user-id'] as string;
    const existingUser = await userModel.show(user_id);

    if (!existingUser) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }
    // Check if the user data to be updated is the same as the existing user data
    const isUserDataSame =
      existingUser.blood_pressure === req.body.blood_pressure &&
      existingUser.pregnancies === req.body.pregnancies &&
      existingUser.glucose === req.body.glucose &&
      existingUser.skin_thickness === req.body.skin_thickness &&
      existingUser.insulin === req.body.insulin &&
      existingUser.bmi === req.body.bmi &&
      existingUser.diabetespedigreefunction === req.body.diabetespedigreefunction &&
      existingUser.age === req.body.age &&
      existingUser.has_diabetes === req.body.has_diabetes;

    // If the user data is the same and there is already a recommendation_id, don't update recommendation_id
    const updateRecommendationId = !isUserDataSame || !existingUser.recommendation_id;

    // Generate a new recommendation_id if needed
    const recommendation_id = updateRecommendationId ? CreateRecommendationId() : existingUser.recommendation_id;

    const updateUser = {
      user_id,
      email: req.body.email as string,
      password: req.body.password as string,
      name: req.body.name as string,
      phone: req.body.phone as string,
      address: req.body.address as string,
      blood_pressure: req.body.blood_pressure as number,
      pregnancies: req.body.pregnancies as number,
      glucose: req.body.glucose as number,
      skin_thickness: req.body.skin_thickness as number,
      insulin: req.body.insulin as number,
      bmi: req.body.bmi as number,
      diabetespedigreefunction: req.body.diabetespedigreefunction as number,
      age: req.body.age as number,
      has_diabetes: req.body.has_diabetes as boolean,
      recommendation_id: updateRecommendationId ? recommendation_id : existingUser.recommendation_id
    };
    // Your validation logic can go here if needed
    const updatedUser = await userModel.updateUser(updateUser);
    res.status(200).json({ Success: updatedUser });
  } catch (err) {
    res.status(400).json({ err: 'Error while Updating User' });
  }
};

*/

export const updateForPredict = async(req:Request,res:Response):Promise<void>=>{
  try {
    const user_id = req.headers['x-user-id'] as string;
    const existingUser = await userModel.show(user_id);

    if (!existingUser) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }
    // Check if the user data to be updated is the same as the existing user data
    const isUserDataSame =
      existingUser.blood_pressure === req.body.blood_pressure &&
      existingUser.pregnancies === req.body.pregnancies &&
      existingUser.glucose === req.body.glucose &&
      existingUser.skin_thickness === req.body.skin_thickness &&
      existingUser.insulin === req.body.insulin &&
      existingUser.bmi === req.body.bmi &&
      existingUser.diabetespedigreefunction === req.body.diabetespedigreefunction &&
      existingUser.age === req.body.age &&
      existingUser.has_diabetes === req.body.has_diabetes;

    // If the user data is the same and there is already a recommendation_id, don't update recommendation_id
    const updateRecommendationId = !isUserDataSame || !existingUser.recommendation_id;

    // Generate a new recommendation_id if needed
    const recommendation_id = updateRecommendationId ? CreateRecommendationId() : existingUser.recommendation_id;
    const pregnancies = existingUser.can_pregnancy ? req.body.pregnancies as number : 0;
    console.log(pregnancies)
    const updateUser = {
      user_id,
      email: req.body.email as string,
      password: req.body.password as string,
      name: req.body.name as string,
      phone: req.body.phone as string,
      blood_pressure: req.body.blood_pressure as number,
      pregnancies,
      glucose: req.body.glucose as number,
      skin_thickness: req.body.skin_thickness as number,
      insulin: req.body.insulin as number,
      bmi: existingUser.bmi ,
      diabetespedigreefunction: req.body.diabetespedigreefunction as number,
      age: existingUser.age,
      has_diabetes: existingUser.has_diabetes,
      recommendation_id: updateRecommendationId ? recommendation_id : existingUser.recommendation_id,
      date_of_birth: existingUser.date_of_birth,
      is_female: existingUser.is_female,
      height: existingUser.height,
      weight: existingUser.weight,
      can_pregnancy: existingUser.can_pregnancy
      };
    // Your validation logic can go here if needed
    const updatedUser = await userModel.updateUserDataForPredict(updateUser);
    res.status(200).json({ Success: updatedUser });
  } catch (err) {
    res.status(400).json({ err: 'Error while Updating User' });
  }
};

// delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.headers['x-user-id'] as string;
    if (!user_id) {
      res.status(400).json({ error: 'Missing user_id' });
      return;
    }
    if (!(await userModel.show(user_id))) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await userModel.delete(user_id);
    res.status(200).json('User deleted');
  } catch (error) {
    res.status(400).json({ error: 'Error while Deleting User' });
  }
};

// User login
export const userLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userCredentials = {
      email: req.body.email as string,
      password: req.body.password as string,
    };

    if (!userCredentials.email || !userCredentials.password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await userModel.findOne(userCredentials.email);
    const user_id = await userModel.authenticate(userCredentials.email, userCredentials.password);

    if (user_id && user) {
      const userToken = generateToken(res, user_id);
      res.status(200).json({ Login: 'Success', token: userToken });
    } else {
      res.status(401).json({ Login: 'Failed' });
    }
  } catch (error) {
    res.status(401).json({ Login: 'Failed, Error While Login' });
  }
};

// User logout
export const userLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    clearToken(res);
    res.status(200).json({ message: 'User logged out' });
  } catch (error) {
    res.status(500).json({ message: 'Error While user logout' });
  }
};