import React, { useState, useEffect } from "react";
import { Activity, Calendar, TrendingUp, Trophy, Sparkles, Scale, Utensils, Brain, Moon, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workout, WeightLog, MealLog, DailyMetrics } from "@/src/types";
import { motion } from "motion/react";
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  workouts: Workout[];
  weightLogs: WeightLog[];
  mealLogs: MealLog[];
  metrics: DailyMetrics[];
}

export default function Dashboard({ workouts, weightLogs, mealLogs, metrics }: DashboardProps) {
  const [tip, setTip] = useState<string>("Loading your daily motivation...");
  const [loadingTip, setLoadingTip] = useState(true);

  useEffect(() => {
    async function fetchTip() {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Give me a short, punchy, and highly motivational fitness or health tip (max 20 words).",
        });
        setTip(response.text || "Keep pushing your limits!");
      } catch (error) {
        console.error("Failed to fetch tip", error);
        setTip("Consistency is the key to success!");
      } finally {
        setLoadingTip(false);
      }
    }
    fetchTip();
  }, []);

  const totalWorkouts = workouts.length;
  
  const totalVolume = workouts.reduce((acc, workout) => {
    return acc + workout.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((setAcc, set) => {
        return setAcc + (set.weight * set.reps);
      }, 0);
    }, 0);
  }, 0);

  const totalExercises = workouts.reduce((acc, workout) => acc + workout.exercises.length, 0);

  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : null;
  const weightDiff = weightLogs.length > 1 ? (weightLogs[0].weight - weightLogs[1].weight).toFixed(1) : null;

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealLogs.find(l => l.date.split('T')[0] === today)?.meals || [];
  const todayMetrics = metrics.find(m => m.date.split('T')[0] === today);

  const stats = [
    {
      title: "Body Weight",
      value: latestWeight ? `${latestWeight}kg` : "--",
      icon: Scale,
      color: "text-purple-500",
      bg: "bg-purple-50",
      sub: weightDiff ? `${Number(weightDiff) > 0 ? '+' : ''}${weightDiff}kg` : "Latest"
    },
    {
      title: "Water Intake",
      value: todayMetrics?.waterIntake ? `${todayMetrics.waterIntake}L` : "--",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
      sub: "Today"
    },
    {
      title: "Sleep Quality",
      value: todayMetrics?.sleepQuality ? `${todayMetrics.sleepQuality}/10` : "--",
      icon: Moon,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      sub: "Last night"
    },
    {
      title: "Stress Level",
      value: todayMetrics?.stressLevel ? `${todayMetrics.stressLevel}/10` : "--",
      icon: Brain,
      color: "text-red-500",
      bg: "bg-red-50",
      sub: "Today"
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mb-1">Daily Motivation</p>
              <p className="text-sm font-medium leading-tight italic">"{tip}"</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Today's Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayMeals.length === 0 && (!todayMetrics?.supplements.length) && (!todayMetrics?.vitamins.length) ? (
              <p className="text-sm text-muted-foreground italic py-4">No nutrition data logged today.</p>
            ) : (
              <div className="space-y-4">
                {todayMeals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Meals</p>
                    {todayMeals.map((meal) => (
                      <div key={meal.id} className="flex justify-between items-center border-b border-primary/10 pb-1 last:border-0">
                        <span className="text-sm font-medium">{meal.name}</span>
                        <span className="text-xs text-muted-foreground">{meal.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
                {todayMetrics?.supplements.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Supplements</p>
                    {todayMetrics.supplements.map((s) => (
                      <div key={s.id} className="flex justify-between items-center border-b border-primary/10 pb-1 last:border-0">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.amountGrams}g</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {todayMetrics?.vitamins.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Vitamins</p>
                    {todayMetrics.vitamins.map((v) => (
                      <div key={v.id} className="flex justify-between items-center border-b border-primary/10 pb-1 last:border-0">
                        <span className="text-sm font-medium">{v.name}</span>
                        <span className="text-xs text-muted-foreground">{v.amountMg}mg</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const height = [40, 70, 30, 90, 50, 20, 10][i];
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className="w-full bg-primary/20 rounded-t-md relative group"
                    >
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
