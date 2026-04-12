import React, { useState } from "react";
import { Plus, Trash2, Save, X, Dumbbell, ListChecks } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Workout, Exercise, Set } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";

interface WorkoutLogProps {
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  initialWorkout?: Workout;
}

export default function WorkoutLog({ onSave, onCancel, initialWorkout }: WorkoutLogProps) {
  const [title, setTitle] = useState(initialWorkout?.title || "New Workout");
  const [exercises, setExercises] = useState<Exercise[]>(initialWorkout?.exercises || []);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      sets: [{ id: Math.random().toString(36).substr(2, 9), reps: 0, weight: 0, completed: false }],
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: Math.random().toString(36).substr(2, 9),
                reps: lastSet?.reps || 0,
                weight: lastSet?.weight || 0,
                completed: false,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((e) =>
        e.id === exerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<Set>) => {
    setExercises(
      exercises.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)) }
          : e
      )
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const workout: Workout = {
      id: initialWorkout?.id || Math.random().toString(36).substr(2, 9),
      date: initialWorkout?.date || new Date().toISOString(),
      title,
      exercises,
    };
    onSave(workout);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 border-b">
        <div className="flex-1 mr-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 p-0 h-auto"
            placeholder="Workout Title"
          />
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

      <AnimatePresence>
        {exercises.map((exercise, exIndex) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: exIndex * 0.05 }}
          >
            <Card className="workout-card overflow-hidden border-none shadow-sm bg-white/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1 mr-4">
                  <Input
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    className="font-semibold text-lg border-none bg-transparent focus-visible:ring-0 p-0 h-auto"
                    placeholder="Exercise Name (e.g. Bench Press)"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                  <div className="col-span-2 text-center">SET</div>
                  <div className="col-span-4 text-center">WEIGHT (KG)</div>
                  <div className="col-span-2 text-center">REPS</div>
                  <div className="col-span-2"></div>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center">
                      <Checkbox 
                        checked={set.completed} 
                        onCheckedChange={(checked) => updateSet(exercise.id, set.id, { completed: !!checked })}
                      />
                    </div>
                    <div className="col-span-1 text-center font-mono text-xs bg-muted rounded-md py-1">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exercise.id, set.id, { weight: parseFloat(e.target.value) })}
                        className="text-center h-9"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exercise.id, set.id, { reps: parseInt(e.target.value) })}
                        className="text-center h-9"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeSet(exercise.id, set.id)}>
                        <X className="w-4 h-4 opacity-50" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => addSet(exercise.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Set
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        variant="outline"
        className="w-full h-16 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        onClick={addExercise}
      >
        <Dumbbell className="w-5 h-5 mr-2" />
        Add Exercise
      </Button>
    </div>
  );
}
