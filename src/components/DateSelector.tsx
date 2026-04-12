import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    onDateChange(newDate);
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()) {
      return "Yesterday";
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between bg-primary/5 p-2 rounded-2xl mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => changeDay(-1)}
        className="rounded-xl hover:bg-primary/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <motion.div 
        key={selectedDate.toISOString()}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-primary" />
          <span className="text-sm font-bold">{formatDate(selectedDate)}</span>
        </div>
        {!isToday(selectedDate) && (
          <button 
            onClick={() => onDateChange(new Date())}
            className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
          >
            Back to Today
          </button>
        )}
      </motion.div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => changeDay(1)}
        className="rounded-xl hover:bg-primary/10"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
