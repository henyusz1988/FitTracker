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
  amountGrams: number;
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
  stressLevel: number; // 1-5
  sleepQuality: number; // 1-5
  waterIntake: number; // in Liters
}

export interface UserConfig {
  uid: string;
  statOrder: string[];
  targetWeight?: number;
  targetWater?: number;
  supplementTargets?: { name: string; targetGrams: number }[];
  vitaminTargets?: { name: string; targetMg: number }[];
  exerciseTargets?: { name: string; targetWeight: number; targetReps: number }[];
}
