import { UserModel } from '../models/user.model';
import { User, UserData } from '../types/UserTypes';
import { Request, Response } from 'express';

const userModel = new UserModel();

interface CheckResult {
  isValid: boolean;
  userData?: UserData;
}

export const CheckUserData = async (userId: string): Promise<CheckResult> => {
  try {
    const user = await userModel.show(userId);

    if (!user) {
      return { isValid: false };
    }

    // Prepare user data for checking
    const userData: UserData = {
      Pregnancies: user.pregnancies as number,
      Glucose: user.glucose as number,
      BloodPressure: user.blood_pressure as number, // Updated to camelCase
      SkinThickness: user.skin_thickness as number,
      Insulin: user.insulin as number,
      BMI: user.bmi as number,
      DiabetesPedigreeFunction: user.diabetespedigreefunction as number, // Updated to camelCase
      Age: user.age as number,
      recommendation_id: user.recommendation_id as string,
    };

    // Filter out undefined or null fields
    const filteredUserData = Object.entries(userData)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Check if all required fields are present
    if (Object.keys(filteredUserData).length !== Object.keys(userData).length) {
      return { isValid: false };
    }

    return { isValid: true, userData };
  } catch (error) {
    return { isValid: false };
  }
};