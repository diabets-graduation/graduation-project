import os
import gdown  # Import gdown for downloading files
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from collections import Counter

import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

class Recommender:
    
    def __init__(self, profiles, recent_activity, meals):
        self.df = meals
        self.profiles = profiles
        self.recent_activity = recent_activity
    
    def get_features(self, dataframe):
        nutrient_dummies = dataframe.nutrient.str.get_dummies(sep=' ')
        disease_dummies = dataframe.Disease.str.get_dummies(sep=' ')
        diet_dummies = dataframe.diet.str.get_dummies(sep=' ')
        feature_df = pd.concat([nutrient_dummies, disease_dummies, diet_dummies], axis=1)
        return feature_df
    
    def content_based(self, user_features):
        feature_df = self.get_features(self.df)
        model = NearestNeighbors(n_neighbors=40, algorithm='ball_tree')
        model.fit(feature_df)
        df_results = pd.DataFrame(columns=list(self.df.columns))
        total_features = list(feature_df.columns)
        d = {i: 0 for i in total_features}
        for i in list(user_features):
            d[i] = 1
        final_input = list(d.values())
        distances, indices = model.kneighbors([final_input])
        for i in list(indices):
            df_results = pd.concat([df_results, self.df.iloc[i]])
        df_results = df_results.filter(['name', 'nutrient', 'Disease', 'diet', 'ingredients', 'steps'])
        df_results = df_results.drop_duplicates(subset=['name'])
        df_results = df_results.reset_index(drop=True)
        return df_results
    
    def find_neighbors(self, user_features, k):
        features_df = self.get_features(self.profiles)
        model = NearestNeighbors(n_neighbors=k, algorithm='ball_tree')
        model.fit(features_df)
        total_features = features_df.columns  
        d = {i: 0 for i in total_features}
        for i in user_features:
            d[i] = 1
        final_input = list(d.values())
        similar_neighbors = pd.DataFrame(columns=list(self.profiles.columns))
        distances, indices = model.kneighbors([final_input])
        for i in list(indices):
            similar_neighbors = pd.concat([similar_neighbors, self.profiles.loc[i]])
        similar_neighbors = similar_neighbors.reset_index(drop=True)
        return similar_neighbors

    def user_based(self, user_features, user_id):
        similar_users = self.find_neighbors(user_features, 10)
        users = list(similar_users.user_id)
        results = self.recent_activity[self.recent_activity.user_id.isin(users)]
        results = results[results['user_id'] != user_id]
        meals = list(results.Meal_Id.unique())
        results = self.df[self.df.Meal_Id.isin(meals)]
        results = results.filter(['Meal_Id', 'name', 'nutrient', 'ingredients', 'steps'])
        results = results.drop_duplicates(subset=['name'])
        results = results.reset_index(drop=True)
        return results

    def recent_activity_based(self, user_id):
        recent_df = self.recent_activity[self.recent_activity['user_id'] == user_id]
        meal_ids = list(recent_df.Meal_Id.unique())
        recent_data = self.df[self.df.Meal_Id.isin(meal_ids)][['nutrient', 'category', 'Disease', 'diet']].reset_index(drop=True)
        disease = []
        diet = []
        nut = []
        user_features = []
        for i in range(recent_data.shape[0]):
            for word in recent_data.loc[i, 'Disease'].split():
                disease.append(word)
        for i in range(recent_data.shape[0]):
            for word in recent_data.loc[i, 'diet'].split():
                diet.append(word)
        for i in range(recent_data.shape[0]):
            for word in recent_data.loc[i, 'nutrient'].split():
                nut.append(word)
        nut_counts = dict(Counter(nut))
        mean_nut = np.mean(list(nut_counts.values()))
        for i in nut_counts.items():
            if i[1] > mean_nut:
                user_features.append(i[0])
        dis_counts = dict(Counter(disease))
        mean_dis = np.mean(list(dis_counts.values()))
        for i in dis_counts.items():
            if i[1] > mean_dis:
                user_features.append(i[0])
        diet_counts = dict(Counter(diet))
        mean_diet = np.mean(list(diet_counts.values()))
        for i in diet_counts.items():
            if i[1] > mean_diet:
                user_features.append(i[0])
        similar_neighbors = self.find_neighbors(user_features, 10)
        return similar_neighbors.filter(['Meal_Id', 'name', 'nutrient', 'ingredients', 'steps', 'rating'])

    def recommend(self, user_id):
        try:
            #finding user's profile features by id
            profile = self.profiles[self.profiles['user_id'] == user_id]
            user_features = []

            # Ensure profile values are converted to strings before splitting
            user_features.extend(str(profile['nutrient'].values[0]).split())
            user_features.extend(str(profile['Disease'].values[0]).split())
            user_features.extend(str(profile['diet'].values[0]).split())

            feature_df = self.get_features(self.df)

            df0 = self.content_based(user_features)
            df1 = self.user_based(user_features, user_id)
            df2 = self.recent_activity_based(user_id)
            #df3 = self.k_neighbor(inputs,feature_df,dataframe,k)

            df = pd.concat([df0, df1, df2])

            df = df.drop_duplicates('ingredients').reset_index(drop=True)
            return df
        except Exception as e:
            return pd.DataFrame({'error': str(e)}, index=[0])

# File paths
user_profiles_path = 'user_Profiles.csv'
recent_activity_path = 'recent_activity.csv'
nut_df_path = 'nut_df.csv'

# Check if files exist before downloading
if not os.path.exists(user_profiles_path):
    print("Downloading user_Profiles.csv...")
    gdown.download('https://drive.google.com/uc?id=1ooY_M37LZAaZyEVHS3slUIcGkZl-BA5Z', user_profiles_path, quiet=False)

if not os.path.exists(recent_activity_path):
    print("Downloading recent_activity.csv...")
    gdown.download('https://drive.google.com/uc?id=1Rwbczxet3m-ZZCojY8OP97J6o3qnjTg_', recent_activity_path, quiet=False)

if not os.path.exists(nut_df_path):
    print("Downloading nut_df.csv...")
    gdown.download('https://drive.google.com/uc?id=16LkePmHrbwNjUy4oEoOYiBhpIhHtoMgL', nut_df_path, quiet=False)

example = Recommender(profiles=pd.read_csv(user_profiles_path),
                      recent_activity=pd.read_csv(recent_activity_path),
                      meals=pd.read_csv(nut_df_path))

@app.route('/recommendation', methods=['POST'])
def recommendation():
    try:
        user_id = request.json.get('recommendation_id')
        if user_id is None:
            return jsonify({'error': 'No recommendation_id provided in the request JSON'})
        result = example.recommend(user_id)
        print("Result",result)
        result_json = result.to_json(orient="records")
        return jsonify({'recommendation': result_json})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)