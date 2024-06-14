/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users(
    user_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    Blood_Pressure INT DEFAULT NULL,
    pregnancies INT DEFAULT NULL,
    glucose INT DEFAULT NULL,
    skin_thickness INT DEFAULT NULL,
    Insulin INT DEFAULT NULL,
    BMI DECIMAL(5, 2) DEFAULT NULL,
    DiabetesPedigreeFunction DECIMAL(5, 3) DEFAULT NULL,
    age INT DEFAULT NULL,
    date_of_birth DATE NOT NULL,
    is_female BOOLEAN NOT NULL DEFAULT false, /*Gender*/
    height INT NOT NULL,
    weight INT NOT NULL,
    can_pregnancy BOOLEAN DEFAULT false,
    has_diabetes BOOLEAN DEFAULT false,
    diabetes_info TEXT DEFAULT 'There is no diabetes information. Please do predict first.',
    recommendation_id VARCHAR(20) DEFAULT NULL
);