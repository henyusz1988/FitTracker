import React, { useState } from "react";
import { Settings as SettingsIcon, ChevronUp, ChevronDown, Save, X, Layout, User as UserIcon, LogOut, Globe, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { UserConfig, Workout, WeightLog, MealLog, DailyMetrics } from "../types";
import { User } from "firebase/auth";
import LanguageSelector from "./LanguageSelector";
import { exportToExcel } from "../lib/exportUtils";

interface SettingsProps {
  config: UserConfig | null;
  user: User | null;
  workouts: Workout[];
  weightLogs: WeightLog[];
  mealLogs: MealLog[];
  metrics: DailyMetrics[];
  onSave: (config: UserConfig) => void;
  onClose: () => void;
  onLogout: () => void;
}

export default function Settings({ 
  config, 
  user, 
  workouts, 
  weightLogs, 
  mealLogs, 
  metrics, 
  onSave, 
  onClose, 
  onLogout 
}: SettingsProps) {
  const { t } = useTranslation();
  const defaultOrder = ['weight', 'water', 'sleep', 'stress'];
  const [order, setOrder] = useState<string[]>(config?.statOrder || defaultOrder);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrder(newOrder);
  };

  const handleSave = () => {
    onSave({
      ...config!,
      statOrder: order,
    });
  };

  const getLabel = (id: string) => {
    switch(id) {
      case 'weight': return t('body_weight');
      case 'water': return t('water_intake');
      case 'sleep': return t('sleep_quality');
      case 'stress': return t('stress_level');
      default: return id;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-none shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            {t('settings')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-1">Account</p>
              <p className="text-sm font-bold truncate">{user?.email}</p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              Language
            </div>
            <div className="flex justify-center p-2 bg-muted/30 rounded-xl border border-border/50">
              <LanguageSelector />
            </div>
          </div>

          {/* Export Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
              <FileDown className="w-4 h-4" />
              Data Management
            </div>
            <Button 
              variant="outline" 
              onClick={() => exportToExcel(workouts, weightLogs, mealLogs, metrics)}
              className="w-full rounded-xl border-dashed hover:border-primary hover:text-primary transition-all"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export to Excel (.xlsx)
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
              <Layout className="w-4 h-4" />
              {t('customise')}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('reorder_stats')}
            </p>
            
            <div className="space-y-2">
              {order.map((id, index) => (
                <div 
                  key={id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50"
                >
                  <span className="font-medium">{getLabel(id)}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={index === order.length - 1}
                      onClick={() => moveItem(index, 'down')}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                {t('close')}
              </Button>
              <Button onClick={handleSave} className="flex-1 rounded-xl shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" />
                {t('save_changes')}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={onLogout} 
              className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
