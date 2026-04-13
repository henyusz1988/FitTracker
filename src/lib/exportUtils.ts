import * as XLSX from 'xlsx';
import { Workout, WeightLog, MealLog, DailyMetrics } from '../types';

export const exportToExcel = (
  workouts: Workout[],
  weightLogs: WeightLog[],
  mealLogs: MealLog[],
  metrics: DailyMetrics[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Daily Summary Sheet (Merged Data)
  const allDates = Array.from(new Set([
    ...workouts.map(w => w.date.split('T')[0]),
    ...weightLogs.map(l => l.date.split('T')[0]),
    ...mealLogs.map(l => l.date.split('T')[0]),
    ...metrics.map(m => m.date.split('T')[0])
  ])).sort();

  const summaryData = allDates.map(date => {
    const dayWeight = weightLogs.find(l => l.date.split('T')[0] === date);
    const dayMetrics = metrics.find(m => m.date.split('T')[0] === date);
    const dayWorkouts = workouts.filter(w => w.date.split('T')[0] === date);
    const dayMeals = mealLogs.find(l => l.date.split('T')[0] === date);

    return {
      Date: date,
      'Weight (kg)': dayWeight?.weight || '',
      'Water (L)': dayMetrics?.waterIntake || '',
      'Sleep Quality (1-10)': dayMetrics?.sleepQuality || '',
      'Stress Level (1-10)': dayMetrics?.stressLevel || '',
      'Workouts Done': dayWorkouts.map(w => w.title).join(', '),
      'Meals Logged': dayMeals?.meals.length || 0,
      'Supplements': dayMetrics?.supplements.map(s => `${s.name} (${s.amountGrams}g)`).join(', ') || '',
      'Vitamins': dayMetrics?.vitamins.map(v => `${v.name} (${v.amountMg}mg)`).join(', ') || ''
    };
  });
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Daily Summary");

  // 2. Workouts Sheet
  const workoutData = workouts.flatMap(w => 
    w.exercises.flatMap(e => 
      e.sets.map((s, i) => ({
        Date: new Date(w.date).toLocaleDateString(),
        Workout: w.title,
        Exercise: e.name,
        Set: i + 1,
        Weight: s.weight,
        Reps: s.reps,
        Completed: s.completed ? 'Yes' : 'No'
      }))
    )
  );
  const wsWorkouts = XLSX.utils.json_to_sheet(workoutData);
  XLSX.utils.book_append_sheet(wb, wsWorkouts, "Workouts");

  // 3. Weight Logs Sheet
  const weightData = weightLogs.map(l => ({
    Date: new Date(l.date).toLocaleDateString(),
    Weight: l.weight
  }));
  const wsWeight = XLSX.utils.json_to_sheet(weightData);
  XLSX.utils.book_append_sheet(wb, wsWeight, "Weight");

  // 4. Nutrition Sheet
  const nutritionData = mealLogs.flatMap(l => 
    l.meals.map(m => ({
      Date: new Date(l.date).toLocaleDateString(),
      Food: m.name,
      Amount: m.amount
    }))
  );
  const wsNutrition = XLSX.utils.json_to_sheet(nutritionData);
  XLSX.utils.book_append_sheet(wb, wsNutrition, "Nutrition");

  // 5. Daily Metrics Sheet
  const metricsData = metrics.map(m => ({
    Date: new Date(m.date).toLocaleDateString(),
    Water: m.waterIntake,
    Sleep: m.sleepQuality,
    Stress: m.stressLevel,
    Supplements: m.supplements.map(s => `${s.name} (${s.amountGrams}g)`).join(', '),
    Vitamins: m.vitamins.map(v => `${v.name} (${v.amountMg}mg)`).join(', ')
  }));
  const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(wb, wsMetrics, "Daily Metrics");

  // Generate and download
  XLSX.writeFile(wb, `GymBro_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
};
