/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, History as HistoryIcon, LayoutDashboard, Dumbbell, Scale, LogOut, User as UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Workout, WeightLog, MealLog, DailyMetrics } from "@/src/types";
import { 
  subscribeWorkouts, saveWorkout as fsSaveWorkout, deleteWorkout as fsDeleteWorkout,
  subscribeWeightLogs, saveWeightLog as fsSaveWeightLog,
  subscribeMealLogs, saveMealLog as fsSaveMealLog,
  subscribeDailyMetrics, saveDailyMetrics as fsSaveDailyMetrics,
  testConnection
} from "@/src/services/firestore";
import { auth, logout } from "@/src/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import WorkoutLog from "@/src/components/WorkoutLog";
import DailyLog from "@/src/components/DailyLog";
import History from "@/src/components/History";
import Dashboard from "@/src/components/Dashboard";
import Login from "@/src/components/Login";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isLoggingDaily, setIsLoggingDaily] = useState(false);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setWeightLogs([]);
      setMealLogs([]);
      setMetrics([]);
      return;
    }

    const unsubWorkouts = subscribeWorkouts(user.uid, setWorkouts);
    const unsubWeight = subscribeWeightLogs(user.uid, setWeightLogs);
    const unsubMeals = subscribeMealLogs(user.uid, setMealLogs);
    const unsubMetrics = subscribeDailyMetrics(user.uid, setMetrics);

    return () => {
      unsubWorkouts();
      unsubWeight();
      unsubMeals();
      unsubMetrics();
    };
  }, [user]);

  const handleSaveWorkout = async (workout: Workout) => {
    if (!user) return;
    await fsSaveWorkout({ ...workout, userId: user.uid });
    setIsLogging(false);
    setEditingWorkout(null);
    setActiveTab("history");
  };

  const handleSaveWeight = async (log: WeightLog) => {
    if (!user) return;
    await fsSaveWeightLog({ ...log, userId: user.uid });
  };

  const handleSaveMeals = async (log: MealLog) => {
    if (!user) return;
    await fsSaveMealLog({ ...log, userId: user.uid });
  };

  const handleSaveMetrics = async (newMetrics: DailyMetrics) => {
    if (!user) return;
    await fsSaveDailyMetrics({ ...newMetrics, userId: user.uid });
    setIsLoggingDaily(false);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!user) return;
    await fsDeleteWorkout(user.uid, id);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsLogging(true);
  };

  const startNewWorkout = () => {
    setEditingWorkout(null);
    setIsLogging(true);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isLogging) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  if (isLoggingDaily) {
    const today = new Date().toISOString().split('T')[0];
    const todayWeight = weightLogs.find(l => l.date.split('T')[0] === today);
    const todayMeals = mealLogs.find(l => l.date.split('T')[0] === today);
    const todayMetrics = metrics.find(m => m.date.split('T')[0] === today);

    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
            <Button 
              variant="ghost"
              onClick={logout}
              className="rounded-full w-12 h-12 p-0 text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="px-6 max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ""} className="w-10 h-10 rounded-full border-2 border-primary/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Welcome back</p>
              <p className="text-sm font-bold">{user.displayName || user.email}</p>
            </div>
          </div>

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
    </ErrorBoundary>
  );
}

