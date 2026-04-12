/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, History as HistoryIcon, LayoutDashboard, Dumbbell, Scale, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Workout, WeightLog, MealLog, DailyMetrics, UserConfig } from "@/src/types";
import { 
  subscribeWorkouts, saveWorkout as fsSaveWorkout, deleteWorkout as fsDeleteWorkout,
  subscribeWeightLogs, saveWeightLog as fsSaveWeightLog,
  subscribeMealLogs, saveMealLog as fsSaveMealLog,
  subscribeDailyMetrics, saveDailyMetrics as fsSaveDailyMetrics,
  subscribeUserConfig, saveUserConfig as fsSaveUserConfig,
  testConnection
} from "@/src/services/firestore";
import { auth, signOut, onAuthStateChanged } from "@/src/firebase";
import { APP_NAME, BUILD_VERSION } from "@/src/constants";
import { User } from "firebase/auth";
import WorkoutLog from "@/src/components/WorkoutLog";
import DailyLog from "@/src/components/DailyLog";
import History from "@/src/components/History";
import Dashboard from "@/src/components/Dashboard";
import Login from "@/src/components/Login";
import DateSelector from "@/src/components/DateSelector";
import LanguageSelector from "@/src/components/LanguageSelector";
import Settings from "@/src/components/Settings";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isLoggingDaily, setIsLoggingDaily] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    testConnection();
    
    // Safety timeout for auth readiness
    const timeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Auth check timed out, forcing ready state");
        setIsAuthReady(true);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      clearTimeout(timeout);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [isAuthReady]);

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
    const unsubConfig = subscribeUserConfig(user.uid, setUserConfig);

    return () => {
      unsubWorkouts();
      unsubWeight();
      unsubMeals();
      unsubMetrics();
      unsubConfig();
    };
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

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

  const handleSaveConfig = async (config: UserConfig) => {
    if (!user) return;
    await fsSaveUserConfig({ ...config, uid: user.uid });
    setIsSettingsOpen(false);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Initializing GymBro...</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAuthReady(true)}
            className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100"
          >
            Skip Loading
          </Button>
        </div>
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
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayWeight = weightLogs.find(l => l.date.split('T')[0] === dateStr);
    const dayMeals = mealLogs.find(l => l.date.split('T')[0] === dateStr);
    const dayMetrics = metrics.find(m => m.date.split('T')[0] === dateStr);

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <DailyLog
            onSaveWeight={handleSaveWeight}
            onSaveMeals={handleSaveMeals}
            onSaveMetrics={handleSaveMetrics}
            onCancel={() => setIsLoggingDaily(false)}
            initialWeight={dayWeight}
            initialMeals={dayMeals}
            initialMetrics={dayMetrics}
            selectedDate={selectedDate}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-24">
        <AnimatePresence>
          {isSettingsOpen && (
            <Settings 
              config={userConfig} 
              onSave={handleSaveConfig} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          )}
        </AnimatePresence>
        <header className="p-6 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none">{APP_NAME}</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">v{BUILD_VERSION}</span>
                <span className="text-[9px] text-muted-foreground/60 font-medium">developed by Peter Henyusz</span>
              </div>
            </div>
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
            <LanguageSelector />
            <Button 
              variant="ghost"
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full w-12 h-12 p-0 text-muted-foreground hover:text-primary"
              title={t('settings')}
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full w-12 h-12 p-0 text-muted-foreground hover:text-destructive"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="px-6 max-w-2xl mx-auto">
          <div className="mb-4 flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{t('welcome_back')}</p>
              <p className="text-sm font-bold">{user.email?.split('@')[0]}</p>
            </div>
          </div>

          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
              <Dashboard 
                workouts={workouts} 
                weightLogs={weightLogs} 
                mealLogs={mealLogs} 
                metrics={metrics} 
                selectedDate={selectedDate}
                config={userConfig}
              />
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
              {activeTab === "dashboard" && <span className="text-[10px] font-bold uppercase tracking-wider">{t('home')}</span>}
            </button>
            
            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center gap-1 p-2 rounded-full transition-all ${
                activeTab === "history" ? "bg-primary text-white px-6" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
              {activeTab === "history" && <span className="text-[10px] font-bold uppercase tracking-wider">{t('history')}</span>}
            </button>
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}

