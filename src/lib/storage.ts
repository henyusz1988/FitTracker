import { Workout, WeightLog, MealLog, DailyMetrics } from "@/src/types";

const STORAGE_KEY = "fittrack_workouts";
const WEIGHT_KEY = "fittrack_weight";
const MEAL_KEY = "fittrack_meals";
const METRICS_KEY = "fittrack_metrics";

export const getWorkouts = (): Workout[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse workouts", e);
    return [];
  }
};

export const saveWorkout = (workout: Workout) => {
  const workouts = getWorkouts();
  const index = workouts.findIndex((w) => w.id === workout.id);
  if (index >= 0) {
    workouts[index] = workout;
  } else {
    workouts.unshift(workout);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
};

export const deleteWorkout = (id: string) => {
  const workouts = getWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getWeightLogs = (): WeightLog[] => {
  const data = localStorage.getItem(WEIGHT_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveWeightLog = (log: WeightLog) => {
  const logs = getWeightLogs();
  const index = logs.findIndex((l) => l.date.split('T')[0] === log.date.split('T')[0]);
  if (index >= 0) {
    logs[index] = log;
  } else {
    logs.unshift(log);
  }
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(logs));
};

export const getMealLogs = (): MealLog[] => {
  const data = localStorage.getItem(MEAL_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveMealLog = (log: MealLog) => {
  const logs = getMealLogs();
  const index = logs.findIndex((l) => l.date.split('T')[0] === log.date.split('T')[0]);
  if (index >= 0) {
    logs[index] = log;
  } else {
    logs.unshift(log);
  }
  localStorage.setItem(MEAL_KEY, JSON.stringify(logs));
};

export const getDailyMetrics = (): DailyMetrics[] => {
  const data = localStorage.getItem(METRICS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveDailyMetrics = (metrics: DailyMetrics) => {
  const allMetrics = getDailyMetrics();
  const index = allMetrics.findIndex((m) => m.date.split('T')[0] === metrics.date.split('T')[0]);
  if (index >= 0) {
    allMetrics[index] = metrics;
  } else {
    allMetrics.unshift(metrics);
  }
  localStorage.setItem(METRICS_KEY, JSON.stringify(allMetrics));
};
