import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface ThemeSettings {
  primaryColor: string;
  transparency: number;
  neonEffects: boolean;
  fontSize: number;
  animations: boolean;
}

export const useTheme = () => {
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch user settings from database
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
  });

  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: "green",
    transparency: 85,
    neonEffects: false,
    fontSize: 14,
    animations: false,
  });

  // Apply theme changes to CSS variables
  const applyThemeChanges = (newSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Color mappings
    const colorMap: Record<string, { primary: string; primaryForeground: string; accent: string; ring: string }> = {
      green: { primary: "120 100% 45%", primaryForeground: "0 0% 0%", accent: "120 100% 50%", ring: "120 100% 45%" },
      blue: { primary: "200 100% 45%", primaryForeground: "0 0% 0%", accent: "200 100% 50%", ring: "200 100% 45%" },
      purple: { primary: "280 100% 45%", primaryForeground: "0 0% 0%", accent: "280 100% 50%", ring: "280 100% 45%" },
      red: { primary: "0 100% 45%", primaryForeground: "0 0% 0%", accent: "0 100% 50%", ring: "0 100% 45%" },
      orange: { primary: "30 100% 45%", primaryForeground: "0 0% 0%", accent: "30 100% 50%", ring: "30 100% 45%" },
    };

    const colors = colorMap[newSettings.primaryColor] || colorMap.green;
    
    // Apply colors
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--ring", colors.ring);
    
    // Apply transparency
    root.style.setProperty("--card-opacity", (newSettings.transparency / 100).toString());
    root.style.setProperty("--modal-opacity", (newSettings.transparency / 100).toString());
    
    // Apply font size
    root.style.fontSize = `${newSettings.fontSize}px`;
    
    // Handle effects
    if (newSettings.neonEffects) {
      root.classList.add("neon-enabled");
    } else {
      root.classList.remove("neon-enabled");
    }
    
    if (newSettings.animations) {
      root.classList.add("animations-enabled");
    } else {
      root.classList.remove("animations-enabled");
    }
  };

  // Update local state when data is loaded - only on first load
  useEffect(() => {
    if (userSettings && typeof userSettings === 'object' && initialLoad) {
      const newSettings = {
        primaryColor: (userSettings as any).primaryColor || "green",
        transparency: parseInt((userSettings as any).transparency) || 85,
        neonEffects: (userSettings as any).neonEffects === "true",
        fontSize: parseInt((userSettings as any).fontSize) || 14,
        animations: (userSettings as any).animations === "true",
      };
      setSettings(newSettings);
      applyThemeChanges(newSettings);
      setInitialLoad(false);
    }
  }, [userSettings, initialLoad]);

  return {
    settings,
    isLoading,
    applyThemeChanges,
    setSettings,
  };
};