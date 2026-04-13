import React, { useState, useEffect } from "react";
import { Save, X, Utensils, Scale, Plus, Trash2, Pill, Zap, Brain, Moon, Droplets, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeightLog, MealLog, Meal, DailyMetrics, Supplement, Vitamin, UserConfig } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";

interface DailyLogProps {
  onSaveWeight: (log: WeightLog) => void;
  onSaveMeals: (log: MealLog) => void;
  onSaveMetrics: (metrics: DailyMetrics) => void;
  onSaveConfig: (config: UserConfig) => void;
  onCancel: () => void;
  initialWeight?: WeightLog;
  initialMeals?: MealLog;
  initialMetrics?: DailyMetrics;
  config: UserConfig | null;
  selectedDate: Date;
}

export default function DailyLog({ 
  onSaveWeight, 
  onSaveMeals, 
  onSaveMetrics, 
  onSaveConfig,
  onCancel, 
  initialWeight, 
  initialMeals, 
  initialMetrics, 
  config,
  selectedDate 
}: DailyLogProps) {
  const { t } = useTranslation();
  const [weight, setWeight] = useState<string>(initialWeight?.weight.toString() || "");
  const [targetWeight, setTargetWeight] = useState<string>(config?.targetWeight?.toString() || "");
  const [targetWater, setTargetWater] = useState<string>(config?.targetWater?.toString() || "");
  const [meals, setMeals] = useState<Meal[]>(initialMeals?.meals || []);
  const [supps, setSupps] = useState<Supplement[]>(initialMetrics?.supplements || []);
  const [vits, setVits] = useState<Vitamin[]>(initialMetrics?.vitamins || []);
  const [stress, setStress] = useState<number>(initialMetrics?.stressLevel || 3);
  const [sleep, setSleep] = useState<number>(initialMetrics?.sleepQuality || 4);
  const [water, setWater] = useState<string>(initialMetrics?.waterIntake?.toString() || "0");
  const [date] = useState(selectedDate.toISOString());

  const [suppTargets, setSuppTargets] = useState<{ name: string; targetGrams: number }[]>(config?.supplementTargets || []);
  const [vitTargets, setVitTargets] = useState<{ name: string; targetMg: number }[]>(config?.vitaminTargets || []);

  const addMeal = () => {
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      amountGrams: 0,
    };
    setMeals([...meals, newMeal]);
  };

  const addSupp = () => {
    const newSupp: Supplement = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      amountGrams: 0,
    };
    setSupps([...supps, newSupp]);
  };

  const addVit = () => {
    const newVit: Vitamin = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      amountMg: 0,
    };
    setVits([...vits, newVit]);
  };

  const handleSave = () => {
    if (weight) {
      onSaveWeight({
        id: initialWeight?.id || Math.random().toString(36).substr(2, 9),
        userId: "", // Will be set by App.tsx
        date,
        weight: parseFloat(weight),
      });
    }
    
    onSaveMeals({
      id: initialMeals?.id || Math.random().toString(36).substr(2, 9),
      userId: "", // Will be set by App.tsx
      date,
      meals,
    });

    onSaveMetrics({
      id: initialMetrics?.id || Math.random().toString(36).substr(2, 9),
      userId: "", // Will be set by App.tsx
      date,
      supplements: supps,
      vitamins: vits,
      stressLevel: stress,
      sleepQuality: sleep,
      waterIntake: parseFloat(water) || 0,
    });

    onSaveConfig({
      ...config!,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      targetWater: targetWater ? parseFloat(targetWater) : undefined,
      supplementTargets: suppTargets,
      vitaminTargets: vitTargets
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{t('daily_log')}</h2>
          <p className="text-sm text-muted-foreground">{selectedDate.toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white">
            <Save className="w-4 h-4 mr-2" />
            {t('save')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{t('body_weight')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="weight" className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Current Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="targetWeight" className="text-[10px] font-bold uppercase text-primary mb-1 block flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Target
                  </Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    placeholder="kg"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="text-lg h-12 border-primary/20 bg-primary/5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">{t('water_intake')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="water" className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Current Intake</Label>
                  <Input
                    id="water"
                    type="number"
                    step="0.1"
                    placeholder="Liters"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="targetWater" className="text-[10px] font-bold uppercase text-primary mb-1 block flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Target
                  </Label>
                  <Input
                    id="targetWater"
                    type="number"
                    step="0.1"
                    placeholder="Liters"
                    value={targetWater}
                    onChange={(e) => setTargetWater(e.target.value)}
                    className="text-lg h-12 border-primary/20 bg-primary/5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">{t('stress_level')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <select
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="w-full h-12 px-4 bg-background border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} - {i + 1 === 1 ? t('very_relaxed') : i + 1 === 3 ? t('moderate') : i + 1 === 5 ? t('highly_stressed') : `Level ${i + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-center text-sm text-muted-foreground font-medium">
              Current: <span className="text-primary font-bold">{stress}/5</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-lg">{t('sleep_quality')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <select
                value={sleep}
                onChange={(e) => setSleep(parseInt(e.target.value))}
                className="w-full h-12 px-4 bg-background border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} - {i + 1 === 1 ? t('very_poor') : i + 1 === 3 ? t('fair') : i + 1 === 5 ? t('excellent') : `Level ${i + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-center text-sm text-muted-foreground font-medium">
              Current: <span className="text-primary font-bold">{sleep}/5</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{t('nutrition')}</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addMeal}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_food')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div key={meal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input placeholder={t('what_did_you_eat')} value={meal.name} onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m))} />
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder={t('how_much')} value={meal.amountGrams || ""} onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, amountGrams: parseFloat(e.target.value) || 0 } : m))} className="text-sm h-8 flex-1" />
                    <span className="text-xs font-bold text-muted-foreground">g</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMeals(meals.filter(m => m.id !== meal.id))} className="mt-1"><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Supplements</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addSupp}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_supplement')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {supps.map((supp) => {
            const target = suppTargets.find(t => t.name.toLowerCase() === supp.name.toLowerCase());
            return (
              <div key={supp.id} className="space-y-2 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder={t('name')} 
                    value={supp.name} 
                    onChange={(e) => setSupps(supps.map(s => s.id === supp.id ? { ...s, name: e.target.value } : s))} 
                    className="flex-1" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => setSupps(supps.filter(s => s.id !== supp.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Amount (g)</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={supp.amountGrams || ""} 
                      onChange={(e) => setSupps(supps.map(s => s.id === supp.id ? { ...s, amountGrams: parseFloat(e.target.value) || 0 } : s))} 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Target (g)
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={target?.targetGrams || ""} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (target) {
                          setSuppTargets(suppTargets.map(t => t.name.toLowerCase() === supp.name.toLowerCase() ? { ...t, targetGrams: val } : t));
                        } else if (supp.name) {
                          setSuppTargets([...suppTargets, { name: supp.name, targetGrams: val }]);
                        }
                      }} 
                      className="h-9 border-primary/20 bg-primary/5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Vitamins</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addVit}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_vitamin')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vits.map((vit) => {
            const target = vitTargets.find(t => t.name.toLowerCase() === vit.name.toLowerCase());
            return (
              <div key={vit.id} className="space-y-2 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder={t('name')} 
                    value={vit.name} 
                    onChange={(e) => setVits(vits.map(v => v.id === vit.id ? { ...v, name: e.target.value } : v))} 
                    className="flex-1" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => setVits(vits.filter(v => v.id !== vit.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Amount (mg)</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={vit.amountMg || ""} 
                      onChange={(e) => setVits(vits.map(v => v.id === vit.id ? { ...v, amountMg: parseFloat(e.target.value) || 0 } : v))} 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Target (mg)
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={target?.targetMg || ""} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (target) {
                          setVitTargets(vitTargets.map(t => t.name.toLowerCase() === vit.name.toLowerCase() ? { ...t, targetMg: val } : t));
                        } else if (vit.name) {
                          setVitTargets([...vitTargets, { name: vit.name, targetMg: val }]);
                        }
                      }} 
                      className="h-9 border-primary/20 bg-primary/5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
