import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import axios from 'axios';
import { UserData } from '../types/UserTypes';
import { CheckUserData } from './user.data.handler';

const userModel = new UserModel();

// Predict diabetes
export const predictDiabetes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(400).json({ error: 'Missing x-user-id header' });
      return;
    }

    // Check if user data is complete
    const userDataCheck = await CheckUserData(userId);
    if (!userDataCheck.isValid) {
      res.status(400).json({ error: 'Incomplete user data, please update profile' });
      return;
    }

    // User data is complete, proceed with prediction
    const userData = userDataCheck.userData as UserData;
    console.log("data_to_predict:", userData);

    // Send user data to AI service for prediction
    const machineApiUrl = 'https://init0x01-diabets-ai.onrender.com/predict'; // Update with your AI service URL
    const aiResponse = await axios.post(machineApiUrl, userData);

    // Get user from UserModel again to ensure the latest data
    const user = await userModel.show(userId);
    // Handle AI service response
    console.log(parseInt(await aiResponse.data.prediction));
    const prediction = parseInt(await aiResponse.data.prediction);
    const hasDiabetes = prediction === 1;
    console.log(hasDiabetes);

    let diabetesInfoMessage = '';

    if (hasDiabetes) {
      diabetesInfoMessage = 'You have been diagnosed with diabetes. Please consult with a healthcare provider for further guidance and treatment options.';
    } else {
      const isInDiabetesRiskRange =
        (userData.BMI >= 25 && userData.BMI <= 29) ||
        (userData.Age >= 45) &&
        (userData.Glucose >= 125 && userData.Glucose <= 140);

      if (isInDiabetesRiskRange) {
        diabetesInfoMessage = 'You do not have diabetes, but you are in a higher risk category based on your BMI, age, or glucose levels. Please consult with a healthcare provider for further guidance.';
      } else {
        diabetesInfoMessage = 'You do not have diabetes. Keep maintaining a healthy lifestyle and consult with your healthcare provider for regular check-ups.';
      }
    }

    // Update user profile based on prediction
    await userModel.updateUserDataForPredict({ ...user, has_diabetes: hasDiabetes });
    await userModel.updateDiabetesInfo(user.user_id as string,diabetesInfoMessage)
    res.status(200).json({
      success: 'Prediction and profile update completed successfully',
      result: prediction,
      has_diabetes: hasDiabetes,
      message: diabetesInfoMessage
    });
  } catch (error) {
    console.error('Error in predictDiabetes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
