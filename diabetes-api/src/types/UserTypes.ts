export type User = {
  user_id?: string;
  name: string;
  phone?: string ;
  email: string;
  password: string;
  blood_pressure?: number ;
  pregnancies?: number ;
  glucose?: number ;
  skin_thickness?: number ;
  insulin?: number ;
  bmi?: number ;
  diabetespedigreefunction?: number ;
  age?: number ;
  date_of_birth: string;
  is_female: boolean;
  height: number;
  weight: number;
  can_pregnancy?: boolean;
  has_diabetes?: boolean ;
  recommendation_id?:string;
};

export type UserData = {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
  recommendation_id?:string;
};