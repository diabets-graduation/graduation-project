import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import axios from 'axios';
import { Parser } from 'json2csv';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import {RECOMENDATION_AI_URL} from '../config'

const userModel = new UserModel();
const pipelineAsync = promisify(pipeline);

export const CreateRecommendation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(400).send('Missing x-user-id header');
            return;
        }

        const user = await userModel.show(userId);
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        const recommendationAiUrl = `${RECOMENDATION_AI_URL}/recommendation`;
        const recommendationResponse = await axios.post(recommendationAiUrl, { recommendation_id: user.recommendation_id });

        if (recommendationResponse?.data?.recommendation) {
            const recommendationsRaw = JSON.parse(recommendationResponse.data.recommendation);
            const meals = recommendationsRaw.map(rec => ({
                name: rec.name || "", 
                nutrient: rec.nutrient || "", 
                disease: rec.Disease ? rec.Disease.split(' ') : [],
                diet: rec.diet ? [rec.diet.replace(/_/g, ' ')] : [],
                ingredients: rec.ingredients ? rec.ingredients.slice(2, -2).split("', '") : [],
                steps: rec.steps ? rec.steps.slice(2, -2).split("', '") : []
            }))
            .filter(meal => meal.name && meal.nutrient && meal.diet && meal.ingredients && meal.steps);

            const fields = ['name', 'nutrient', 'disease', 'diet', 'ingredients', 'steps'];
            const json2csvParser = new Parser({ fields });
            const csvContent = json2csvParser.parse(meals);

            const tempDir = './temp';
            const tempFilePath = `${tempDir}/${user.name.replace(/ /g, '_')}Recommendations.csv`;

            // Check if the temp directory exists, if not, create it
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir);
            }

            await createWriteStream(tempFilePath).write(csvContent);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${user.name.replace(/ /g, '_')}Recommendations.csv"`);

            await pipelineAsync(createReadStream(tempFilePath), res);
        } else {
            res.status(204).send('No content available to generate recommendations');
        }
    } catch (error) {
        console.error('Error in CreateRecommendation:', error);
        res.status(500).send('Internal Server Error');
    }
};
