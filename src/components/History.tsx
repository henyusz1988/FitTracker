import React from "react";
import { Calendar as CalendarIcon, ChevronRight, Dumbbell, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workout } from "@/src/types";
import { motion } from "motion/react";

interface HistoryProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

export default function History({ workouts, onEdit, onDelete }: HistoryProps) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Dumbbell className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No workouts yet</h3>
          <p className="text-sm text-muted-foreground">Start your fitness journey by logging your first workout!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {workouts.map((workout, index) => (
        <motion.div
          key={workout.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="workout-card border-none shadow-sm cursor-pointer group" onClick={() => onEdit(workout)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {workout.title}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {new Date(workout.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(workout.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.slice(0, 3).map((ex) => (
                  <Badge key={ex.id} variant="secondary" className="font-normal">
                    {ex.name || "Unnamed Exercise"}
                  </Badge>
                ))}
                {workout.exercises.length > 3 && (
                  <Badge variant="outline" className="font-normal">
                    +{workout.exercises.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
