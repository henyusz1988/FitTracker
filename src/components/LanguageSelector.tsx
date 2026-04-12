import React from "react";
import { useTranslation } from "react-i18next";
import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full w-10 h-10 p-0 text-muted-foreground hover:text-primary hover:bg-muted transition-colors flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Languages className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-none shadow-xl bg-white/90 backdrop-blur-md">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer rounded-lg m-1"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
            {currentLanguage.code === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
