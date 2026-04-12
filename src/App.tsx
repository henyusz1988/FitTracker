/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, History as HistoryIcon, LayoutDashboard, Dumbbell, Scale, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Workout, WeightLog, MealLog, DailyMetrics } from "@/src/types";
import { getWorkouts, saveWorkout, deleteWorkout, getWeightLogs, saveWeightLog, getMealLogs, saveMealLog, getDailyMetrics, saveDailyMetrics } from "@/src/lib/storage";
import { exportToExcel } from "@/src/lib/excelExport";
import WorkoutLog from "@/src/components/WorkoutLog";
import DailyLog from "@/src/components/DailyLog";
import History from "@/src/components/History";
import Dashboard from "@/src/components/Dashboard";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isLoggingDaily, setIsLoggingDaily] = useState(false);

  useEffect(() => {
    setWorkouts(getWorkouts());
    setWeightLogs(getWeightLogs());
    setMealLogs(getMealLogs());
    setMetrics(getDailyMetrics());
  }, []);

  const handleSaveWorkout = (workout: Workout) => {
    saveWorkout(workout);
    const updatedWorkouts = getWorkouts();
    setWorkouts(updatedWorkouts);
    setIsLogging(false);
    setEditingWorkout(null);
    setActiveTab("history");
    // Automatic background export
    exportToExcel(updatedWorkouts, weightLogs, mealLogs, metrics);
  };

  const handleSaveWeight = (log: WeightLog) => {
    saveWeightLog(log);
    const updatedWeight = getWeightLogs();
    setWeightLogs(updatedWeight);
    // Automatic background export
    exportToExcel(workouts, updatedWeight, mealLogs, metrics);
  };

  const handleSaveMeals = (log: MealLog) => {
    saveMealLog(log);
    const updatedMeals = getMealLogs();
    setMealLogs(updatedMeals);
    // Automatic background export
    exportToExcel(workouts, weightLogs, updatedMeals, metrics);
  };

  const handleSaveMetrics = (newMetrics: DailyMetrics) => {
    saveDailyMetrics(newMetrics);
    const updatedMetrics = getDailyMetrics();
    setMetrics(updatedMetrics);
    setIsLoggingDaily(false);
    // Automatic background export
    exportToExcel(workouts, weightLogs, mealLogs, updatedMetrics);
  };

  const handleExport = () => {
    exportToExcel(workouts, weightLogs, mealLogs, metrics);
  };

  const handleDeleteWorkout = (id: string) => {
    deleteWorkout(id);
    setWorkouts(getWorkouts());
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsLogging(true);
  };

  const startNewWorkout = () => {
    setEditingWorkout(null);
    setIsLogging(true);
  };

  if (isLogging) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <WorkoutLog
          onSave={handleSaveWorkout}
          onCancel={() => {
            setIsLogging(false);
            setEditingWorkout(null);
          }}
          initialWorkout={editingWorkout || undefined}
        />
      </div>
    );
  }

  if (isLoggingDaily) {
    const today = new Date().toISOString().split('T')[0];
    const todayWeight = weightLogs.find(l => l.date.split('T')[0] === today);
    const todayMeals = mealLogs.find(l => l.date.split('T')[0] === today);
    const todayMetrics = metrics.find(m => m.date.split('T')[0] === today);

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <DailyLog
          onSaveWeight={handleSaveWeight}
          onSaveMeals={handleSaveMeals}
          onSaveMetrics={handleSaveMetrics}
          onCancel={() => setIsLoggingDaily(false)}
          initialWeight={todayWeight}
          initialMeals={todayMeals}
          initialMetrics={todayMetrics}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">FitTrack</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleExport}
            className="rounded-full w-12 h-12 p-0 border-primary text-primary hover:bg-primary/5"
            title="Export to Excel"
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsLoggingDaily(true)}
            className="rounded-full w-12 h-12 p-0 border-primary text-primary hover:bg-primary/5"
          >
            <Scale className="w-5 h-5" />
          </Button>
          <Button 
            onClick={startNewWorkout}
            className="rounded-full w-12 h-12 p-0 shadow-lg shadow-primary/30"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <main className="px-6 max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
            <Dashboard workouts={workouts} weightLogs={weightLogs} mealLogs={mealLogs} metrics={metrics} />
          </TabsContent>
          <TabsContent value="history" className="mt-0 focus-visible:ring-0">
            <History 
              workouts={workouts} 
              onEdit={handleEditWorkout} 
              onDelete={handleDeleteWorkout} 
            />
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-50">
        <div className="glass rounded-full p-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 p-2 rounded-full transition-all ${
              activeTab === "dashboard" ? "bg-primary text-white px-6" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === "dashboard" && <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>}
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 p-2 rounded-full transition-all ${
              activeTab === "history" ? "bg-primary text-white px-6" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            {activeTab === "history" && <span className="text-[10px] font-bold uppercase tracking-wider">History</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}

