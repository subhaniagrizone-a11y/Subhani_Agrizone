export type ColorScheme =
  | "eco-green"
  | "ocean-blue"
  | "sunset"
  | "forest"
  | "harvest";

export interface ThemePreset {
  id: ColorScheme;
  name: string;
  primary: string;
  accent: string;
  secondary: string;
  description: string;
}

export const themePresets: Record<ColorScheme, ThemePreset> = {
  "eco-green": {
    id: "eco-green",
    name: "Eco Green",
    primary: "#10b981",
    accent: "#34d399",
    secondary: "#059669",
    description: "Natural, sustainable agriculture colors",
  },
  "ocean-blue": {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "#0ea5e9",
    accent: "#38bdf8",
    secondary: "#0284c7",
    description: "Cool, professional water tones",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    primary: "#f97316",
    accent: "#fb923c",
    secondary: "#ea580c",
    description: "Warm, energetic agricultural vibes",
  },
  forest: {
    id: "forest",
    name: "Forest",
    primary: "#15803d",
    accent: "#22c55e",
    secondary: "#166534",
    description: "Deep green farming heritage",
  },
  harvest: {
    id: "harvest",
    name: "Harvest",
    primary: "#d97706",
    accent: "#f59e0b",
    secondary: "#b45309",
    description: "Golden agricultural abundance",
  },
};

interface ThemeState {
  colorScheme: ColorScheme;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  fontFamily: "system" | "inter" | "playfair";

  setColorScheme: (scheme: ColorScheme) => void;
  setCustomColors: (colors: {
    primary: string;
    accent: string;
    secondary: string;
  }) => void;
  setTheme: (theme: "light" | "dark") => void;
  setFontFamily: (font: "system" | "inter" | "playfair") => void;
  resetToDefault: () => void;
  applyTheme: () => void;
}

const STORAGE_KEY = "theme-storage";

function readStoredState(): Partial<ThemeState> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeStoredState(state: ThemeState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

const initialState: ThemeState = {
  colorScheme: "eco-green",
  primaryColor: "#10b981",
  accentColor: "#34d399",
  secondaryColor: "#059669",
  theme: "light",
  fontFamily: "system",
  setColorScheme: () => undefined,
  setCustomColors: () => undefined,
  setTheme: () => undefined,
  setFontFamily: () => undefined,
  resetToDefault: () => undefined,
  applyTheme: () => undefined,
};

function createThemeStore() {
  let state: ThemeState = {
    ...initialState,
    ...readStoredState(),
    setColorScheme: (scheme: ColorScheme) => {
      const preset = themePresets[scheme];
      state = {
        ...state,
        colorScheme: scheme,
        primaryColor: preset.primary,
        accentColor: preset.accent,
        secondaryColor: preset.secondary,
      };
      writeStoredState(state);
      state.applyTheme();
    },
    setCustomColors: (colors) => {
      state = {
        ...state,
        colorScheme: "eco-green",
        primaryColor: colors.primary,
        accentColor: colors.accent,
        secondaryColor: colors.secondary,
      };
      writeStoredState(state);
      state.applyTheme();
    },
    setTheme: (theme: "light" | "dark") => {
      state = { ...state, theme };
      writeStoredState(state);
      state.applyTheme();
    },
    setFontFamily: (font: "system" | "inter" | "playfair") => {
      state = { ...state, fontFamily: font };
      writeStoredState(state);
      state.applyTheme();
    },
    resetToDefault: () => {
      state = {
        ...state,
        colorScheme: "eco-green",
        primaryColor: "#10b981",
        accentColor: "#34d399",
        secondaryColor: "#059669",
        theme: "light",
        fontFamily: "system",
      };
      writeStoredState(state);
      state.applyTheme();
    },
    applyTheme: () => {
      const root = document.documentElement;
      root.style.setProperty("--color-primary", state.primaryColor);
      root.style.setProperty("--color-accent", state.accentColor);
      root.style.setProperty("--color-secondary", state.secondaryColor);

      const fontClasses: Record<string, string> = {
        system: "font-system",
        inter: "font-inter",
        playfair: "font-playfair",
      };

      document.body.className = document.body.className.replace(
        /font-(system|inter|playfair)/,
        fontClasses[state.fontFamily],
      );
    },
  };

  return {
    getState: () => state,
    setState: (patch: Partial<ThemeState>) => {
      state = { ...state, ...patch };
      writeStoredState(state);
      state.applyTheme();
    },
  };
}

export const useThemeStore = createThemeStore();

if (typeof window !== "undefined") {
  useThemeStore.getState().applyTheme();
}
