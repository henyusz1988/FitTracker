import React, { useState, useEffect } from "react";
import { Activity, Calendar, TrendingUp, Trophy, Sparkles, Scale, Utensils, Brain, Moon, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workout, WeightLog, MealLog, DailyMetrics } from "@/src/types";
import { motion } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from "react-i18next";

interface DashboardProps {
  workouts: Workout[];
  weightLogs: WeightLog[];
  mealLogs: MealLog[];
  metrics: DailyMetrics[];
  selectedDate: Date;
}

export default function Dashboard({ workouts, weightLogs, mealLogs, metrics, selectedDate }: DashboardProps) {
  const { t } = useTranslation();
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

  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const dayWorkouts = workouts.filter(w => w.date.split('T')[0] === dateStr);
  const dayWeight = weightLogs.find(l => l.date.split('T')[0] === dateStr);
  const dayMeals = mealLogs.find(l => l.date.split('T')[0] === dateStr)?.meals || [];
  const dayMetrics = metrics.find(m => m.date.split('T')[0] === dateStr);

  const stats = [
    {
      title: t('body_weight'),
      value: dayWeight ? `${dayWeight.weight}kg` : "--",
      icon: Scale,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      sub: dayWeight ? t('recorded') : t('no_record')
    },
    {
      title: t('water_intake'),
      value: dayMetrics?.waterIntake ? `${dayMetrics.waterIntake}L` : "--",
      icon: Droplets,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      sub: t('daily')
    },
    {
      title: t('sleep_quality'),
      value: dayMetrics?.sleepQuality ? `${dayMetrics.sleepQuality}/10` : "--",
      icon: Moon,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      sub: t('quality')
    },
    {
      title: t('stress_level'),
      value: dayMetrics?.stressLevel ? `${dayMetrics.stressLevel}/10` : "--",
      icon: Brain,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      sub: t('level')
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
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mb-1">{t('daily_motivation')}</p>
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
        <Card className="border-none shadow-sm bg-muted/40 border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              {t('nutrition')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dayMeals.length === 0 && (!dayMetrics?.supplements.length) && (!dayMetrics?.vitamins.length) ? (
              <p className="text-sm text-muted-foreground italic py-4">{t('no_nutrition_data')}</p>
            ) : (
              <div className="space-y-4">
                {dayMeals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Meals</p>
                    {dayMeals.map((meal) => (
                      <div key={meal.id} className="flex justify-between items-center border-b border-border/30 pb-1 last:border-0">
                        <span className="text-sm font-medium">{meal.name}</span>
                        <span className="text-xs text-muted-foreground">{meal.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
                {dayMetrics?.supplements.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Supplements</p>
                    {dayMetrics.supplements.map((s) => (
                      <div key={s.id} className="flex justify-between items-center border-b border-border/30 pb-1 last:border-0">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.amountGrams}g</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {dayMetrics?.vitamins.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Vitamins</p>
                    {dayMetrics.vitamins.map((v) => (
                      <div key={v.id} className="flex justify-between items-center border-b border-border/30 pb-1 last:border-0">
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

        <Card className="border-none shadow-sm bg-muted/40 border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t('workouts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4">{t('no_workouts_data')}</p>
            ) : (
              <div className="space-y-3">
                {dayWorkouts.map((workout) => (
                  <div key={workout.id} className="p-3 bg-background/60 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-sm font-bold">{workout.title}</p>
                    <p className="text-[10px] text-muted-foreground">{workout.exercises.length} {t('exercises')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
