import * as XLSX from 'xlsx';
import { Workout, WeightLog, MealLog, DailyMetrics } from '@/src/types';

export const exportToExcel = (
  workouts: Workout[],
  weightLogs: WeightLog[],
  mealLogs: MealLog[],
  metrics: DailyMetrics[]
) => {
  const wb = XLSX.utils.book_new();

  // Workouts Sheet
  const workoutData = workouts.flatMap(w => 
    w.exercises.flatMap(e => 
      e.sets.map((s, i) => ({
        Date: new Date(w.date).toLocaleDateString(),
        Workout: w.title,
        Exercise: e.name,
        Set: i + 1,
        Weight: s.weight,
        Reps: s.reps,
        Completed: s.completed ? 'Yes' : 'No',
        Notes: w.notes || ''
      }))
    )
  );
  const wsWorkouts = XLSX.utils.json_to_sheet(workoutData);
  XLSX.utils.book_append_sheet(wb, wsWorkouts, "Workouts");

  // Weight Sheet
  const weightData = weightLogs.map(w => ({
    Date: new Date(w.date).toLocaleDateString(),
    Weight: w.weight
  }));
  const wsWeight = XLSX.utils.json_to_sheet(weightData);
  XLSX.utils.book_append_sheet(wb, wsWeight, "Weight");

  // Nutrition Sheet
  const nutritionData = mealLogs.flatMap(m => 
    m.meals.map(meal => ({
      Date: new Date(m.date).toLocaleDateString(),
      Food: meal.name,
      Amount: meal.amount
    }))
  );
  const wsNutrition = XLSX.utils.json_to_sheet(nutritionData);
  XLSX.utils.book_append_sheet(wb, wsNutrition, "Nutrition");

  // Metrics Sheet (Supps, Vits, Stress, Sleep, Water)
  const metricsData = metrics.map(m => ({
    Date: new Date(m.date).toLocaleDateString(),
    StressLevel: m.stressLevel,
    SleepQuality: m.sleepQuality,
    WaterIntake_L: m.waterIntake,
    Supplements: m.supplements.map(s => `${s.name} (${s.amountGrams}g)`).join(', '),
    Vitamins: m.vitamins.map(v => `${v.name} (${v.amountMg}mg)`).join(', ')
  }));
  const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(wb, wsMetrics, "Daily Metrics");

  // Save File
  XLSX.writeFile(wb, `FitTrack_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
