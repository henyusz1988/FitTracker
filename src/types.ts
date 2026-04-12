export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  title: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
}

export interface Meal {
  id: string;
  name: string;
  amount: string;
  calories?: number;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
}

export interface Supplement {
  id: string;
  name: string;
  amountGrams: number;
}

export interface Vitamin {
  id: string;
  name: string;
  amountMg: number;
}

export interface DailyMetrics {
  id: string;
  userId: string;
  date: string;
  supplements: Supplement[];
  vitamins: Vitamin[];
  stressLevel: number; // 1-10
  sleepQuality: number; // 1-10
  waterIntake: number; // in Liters
}

export interface UserConfig {
  uid: string;
  statOrder: string[];
}
