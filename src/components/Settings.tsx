import React, { useState } from "react";
import { Settings as SettingsIcon, ChevronUp, ChevronDown, Save, X, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { UserConfig } from "../types";

interface SettingsProps {
  config: UserConfig | null;
  onSave: (config: UserConfig) => void;
  onClose: () => void;
}

export default function Settings({ config, onSave, onClose }: SettingsProps) {
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
      uid: config?.uid || "",
      statOrder: order
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
        <CardContent className="p-6 space-y-6">
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

          <div className="pt-4 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              {t('close')}
            </Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-2" />
              {t('save_changes')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
