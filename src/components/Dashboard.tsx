import React, { useState } from "react";
import { Activity, Scale, Utensils, Brain, Moon, Droplets, ChartLine, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workout, WeightLog, MealLog, DailyMetrics, UserConfig } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import ProgressChart from "./ProgressChart";

interface DashboardProps {
  workouts: Workout[];
  weightLogs: WeightLog[];
  mealLogs: MealLog[];
  metrics: DailyMetrics[];
  selectedDate: Date;
  config: UserConfig | null;
  onEdit: () => void;
}

export default function Dashboard({ workouts, weightLogs, mealLogs, metrics, selectedDate, config, onEdit }: DashboardProps) {
  const { t } = useTranslation();
  const [activeChart, setActiveChart] = useState<{ title: string; data: { date: string; value: number }[]; unit?: string; color?: string } | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const dayWorkouts = workouts.filter(w => w.date.split('T')[0] === dateStr);
  const dayWeight = weightLogs.find(l => l.date.split('T')[0] === dateStr);
  const dayMeals = mealLogs.find(l => l.date.split('T')[0] === dateStr)?.meals || [];
  const dayMetrics = metrics.find(m => m.date.split('T')[0] === dateStr);

  const stats = [
    {
      id: 'weight',
      title: t('body_weight'),
      value: dayWeight ? `${dayWeight.weight}kg` : "--",
      icon: Scale,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      sub: dayWeight ? t('recorded') : t('no_record'),
      chartData: weightLogs.map(l => ({ date: l.date, value: l.weight })),
      unit: "kg",
      chartColor: "#a855f7"
    },
    {
      id: 'water',
      title: t('water_intake'),
      value: dayMetrics?.waterIntake ? `${dayMetrics.waterIntake}L` : "--",
      icon: Droplets,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      sub: t('daily'),
      chartData: metrics.filter(m => m.waterIntake !== undefined).map(m => ({ date: m.date, value: m.waterIntake! })),
      unit: "L",
      chartColor: "#3b82f6"
    },
    {
      id: 'sleep',
      title: t('sleep_quality'),
      value: dayMetrics?.sleepQuality ? `${dayMetrics.sleepQuality}/10` : "--",
      icon: Moon,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      sub: t('quality'),
      chartData: metrics.filter(m => m.sleepQuality !== undefined).map(m => ({ date: m.date, value: m.sleepQuality! })),
      unit: "/10",
      chartColor: "#6366f1"
    },
    {
      id: 'stress',
      title: t('stress_level'),
      value: dayMetrics?.stressLevel ? `${dayMetrics.stressLevel}/10` : "--",
      icon: Brain,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      sub: t('level'),
      chartData: metrics.filter(m => m.stressLevel !== undefined).map(m => ({ date: m.date, value: m.stressLevel! })),
      unit: "/10",
      chartColor: "#ef4444"
    },
  ];

  const orderedStats = config?.statOrder 
    ? config.statOrder.map(id => stats.find(s => s.id === id)).filter(Boolean) as typeof stats
    : stats;

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence>
        {activeChart && (
          <ProgressChart
            title={activeChart.title}
            data={activeChart.data}
            unit={activeChart.unit}
            color={activeChart.color}
            onClose={() => setActiveChart(null)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        {orderedStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            layout
          >
            <Card className="border-none shadow-sm overflow-hidden relative group">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-background/50 backdrop-blur-sm shadow-sm"
                    onClick={() => setActiveChart({ title: stat.title, data: stat.chartData, unit: stat.unit, color: stat.chartColor })}
                  >
                    <ChartLine className="w-3.5 h-3.5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-background/50 backdrop-blur-sm shadow-sm"
                    onClick={onEdit}
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                  </Button>
                </div>
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
