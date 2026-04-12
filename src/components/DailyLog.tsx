import React, { useState, useEffect } from "react";
import { Save, X, Utensils, Scale, Plus, Trash2, Pill, Zap, Brain, Moon, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { WeightLog, MealLog, Meal, DailyMetrics, Supplement, Vitamin } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";

interface DailyLogProps {
  onSaveWeight: (log: WeightLog) => void;
  onSaveMeals: (log: MealLog) => void;
  onSaveMetrics: (metrics: DailyMetrics) => void;
  onCancel: () => void;
  initialWeight?: WeightLog;
  initialMeals?: MealLog;
  initialMetrics?: DailyMetrics;
}

export default function DailyLog({ onSaveWeight, onSaveMeals, onSaveMetrics, onCancel, initialWeight, initialMeals, initialMetrics }: DailyLogProps) {
  const [weight, setWeight] = useState<string>(initialWeight?.weight.toString() || "");
  const [meals, setMeals] = useState<Meal[]>(initialMeals?.meals || []);
  const [supps, setSupps] = useState<Supplement[]>(initialMetrics?.supplements || []);
  const [vits, setVits] = useState<Vitamin[]>(initialMetrics?.vitamins || []);
  const [stress, setStress] = useState<number>(initialMetrics?.stressLevel || 5);
  const [sleep, setSleep] = useState<number>(initialMetrics?.sleepQuality || 7);
  const [water, setWater] = useState<string>(initialMetrics?.waterIntake?.toString() || "0");
  const [date] = useState(new Date().toISOString());

  const addMeal = () => {
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      amount: "",
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
        date,
        weight: parseFloat(weight),
      });
    }
    
    onSaveMeals({
      id: initialMeals?.id || Math.random().toString(36).substr(2, 9),
      date,
      meals,
    });

    onSaveMetrics({
      id: initialMetrics?.id || Math.random().toString(36).substr(2, 9),
      date,
      supplements: supps,
      vitamins: vits,
      stressLevel: stress,
      sleepQuality: sleep,
      waterIntake: parseFloat(water) || 0,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Daily Log</h2>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Body Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="weight" className="sr-only">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <span className="text-lg font-semibold text-muted-foreground">kg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Water Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="water" className="sr-only">Water (L)</Label>
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
              <span className="text-lg font-semibold text-muted-foreground">L</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">Stress Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>RELAXED</span>
              <span>MODERATE</span>
              <span>STRESSED</span>
            </div>
            <Slider
              value={[stress]}
              onValueChange={(val) => setStress(val[0])}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
            <p className="text-center font-bold text-2xl text-primary">{stress}/10</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-lg">Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>POOR</span>
              <span>FAIR</span>
              <span>GREAT</span>
            </div>
            <Slider
              value={[sleep]}
              onValueChange={(val) => setSleep(val[0])}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
            <p className="text-center font-bold text-2xl text-primary">{sleep}/10</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Nutrition</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addMeal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div key={meal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input placeholder="What did you eat?" value={meal.name} onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m))} />
                  <Input placeholder="How much? (e.g. 200g, 1 bowl)" value={meal.amount} onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, amount: e.target.value } : m))} className="text-sm h-8" />
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
            Add Supplement
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {supps.map((supp) => (
            <div key={supp.id} className="flex gap-2 items-center">
              <Input placeholder="Name" value={supp.name} onChange={(e) => setSupps(supps.map(s => s.id === supp.id ? { ...s, name: e.target.value } : s))} className="flex-1" />
              <div className="flex items-center gap-2 w-32">
                <Input type="number" placeholder="Amount" value={supp.amountGrams || ""} onChange={(e) => setSupps(supps.map(s => s.id === supp.id ? { ...s, amountGrams: parseFloat(e.target.value) } : s))} />
                <span className="text-xs font-bold text-muted-foreground">g</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSupps(supps.filter(s => s.id !== supp.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
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
            Add Vitamin
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vits.map((vit) => (
            <div key={vit.id} className="flex gap-2 items-center">
              <Input placeholder="Name" value={vit.name} onChange={(e) => setVits(vits.map(v => v.id === vit.id ? { ...v, name: e.target.value } : v))} className="flex-1" />
              <div className="flex items-center gap-2 w-32">
                <Input type="number" placeholder="Amount" value={vit.amountMg || ""} onChange={(e) => setVits(vits.map(v => v.id === vit.id ? { ...v, amountMg: parseFloat(e.target.value) } : v))} />
                <span className="text-xs font-bold text-muted-foreground">mg</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setVits(vits.filter(v => v.id !== vit.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
