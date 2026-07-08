"use client";

import { useCallback, useEffect, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ColorScheme = "eco-green" | "ocean-blue" | "sunset" | "forest" | "harvest";

interface ThemePreset {
  id: ColorScheme;
  name: string;
  primary: string;
  accent: string;
  secondary: string;
}

const themePresets: ThemePreset[] = [
  {
    id: "eco-green",
    name: "Eco Green",
    primary: "#10b981",
    accent: "#34d399",
    secondary: "#059669",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "#0ea5e9",
    accent: "#38bdf8",
    secondary: "#0284c7",
  },
  {
    id: "sunset",
    name: "Sunset",
    primary: "#f97316",
    accent: "#fb923c",
    secondary: "#ea580c",
  },
  {
    id: "forest",
    name: "Forest",
    primary: "#15803d",
    accent: "#22c55e",
    secondary: "#166534",
  },
  {
    id: "harvest",
    name: "Harvest",
    primary: "#d97706",
    accent: "#f59e0b",
    secondary: "#b45309",
  },
];

export function ThemeCustomizer() {
  const [selectedScheme, setSelectedScheme] =
    useState<ColorScheme>("eco-green");
  const [customColors, setCustomColors] = useState({
    primary: "#10b981",
    accent: "#34d399",
    secondary: "#059669",
  });
  const [isCustom, setIsCustom] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("theme-preferences");
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedScheme(prefs.colorScheme);
      setCustomColors(prefs.customColors);
      setIsCustom(prefs.isCustom);
      applyTheme(prefs.customColors);
    }
  }, []);

  const applyTheme = useCallback((colors: typeof customColors) => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-secondary", colors.secondary);

    // Update Tailwind classes dynamically
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty("--accent", colors.accent);
  }, []);

  const handlePresetSelect = (preset: ThemePreset) => {
    setSelectedScheme(preset.id);
    setIsCustom(false);
    const colors = {
      primary: preset.primary,
      accent: preset.accent,
      secondary: preset.secondary,
    };
    setCustomColors(colors);
    applyTheme(colors);

    localStorage.setItem(
      "theme-preferences",
      JSON.stringify({
        colorScheme: preset.id,
        customColors: colors,
        isCustom: false,
      }),
    );
  };

  const handleCustomColorChange = (
    key: "primary" | "accent" | "secondary",
    value: string,
  ) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    setIsCustom(true);
    applyTheme(newColors);

    localStorage.setItem(
      "theme-preferences",
      JSON.stringify({
        colorScheme: "custom",
        customColors: newColors,
        isCustom: true,
      }),
    );
  };

  const handleReset = () => {
    const defaultPreset = themePresets[0];
    handlePresetSelect(defaultPreset);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Schemes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {themePresets.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetSelect(preset)}
              className={`relative p-4 rounded-lg border-2 transition-all group ${
                selectedScheme === preset.id && !isCustom
                  ? "border-foreground/80"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              <div className="space-y-2">
                <div
                  className="h-8 w-full rounded-md shadow-sm"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="h-4 w-full rounded-md shadow-sm"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-center truncate">
                {preset.name}
              </p>
              {selectedScheme === preset.id && !isCustom && (
                <div className="absolute inset-0 rounded-lg border-2 border-foreground ring-2 ring-foreground/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
        <div className="space-y-4">
          {["primary", "accent", "secondary"].map((colorKey) => (
            <div key={colorKey} className="flex items-center gap-4">
              <label className="text-sm font-medium w-24 capitalize">
                {colorKey}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColors[colorKey as keyof typeof customColors]}
                  onChange={(e) =>
                    handleCustomColorChange(
                      colorKey as "primary" | "accent" | "secondary",
                      e.target.value,
                    )
                  }
                  className="h-10 w-16 rounded cursor-pointer border"
                />
                <input
                  type="text"
                  value={customColors[colorKey as keyof typeof customColors]}
                  onChange={(e) =>
                    handleCustomColorChange(
                      colorKey as "primary" | "accent" | "secondary",
                      e.target.value,
                    )
                  }
                  className="text-xs font-mono border rounded px-2 py-1 w-24"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="outline" className="w-full gap-2">
        <RotateCcw className="h-4 w-4" />
        Reset to Default
      </Button>
    </div>
  );
}
