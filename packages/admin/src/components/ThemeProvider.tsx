import * as React from "react";

type Theme = "light" | "dark" | "system";

export type Palette = "classic" | "modern";

export const PALETTES: { id: Palette; label: string; accent: string; sidebar: string }[] = [
	{ id: "classic", label: "Classic", accent: "#2271b1", sidebar: "#1d2327" },
	{ id: "modern", label: "Modern", accent: "#f6821f", sidebar: "#1a1a1a" },
];

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	/** The resolved theme (always "light" or "dark") */
	resolvedTheme: "light" | "dark";
	/** The active color palette */
	palette: Palette;
	setPalette: (palette: Palette) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "emdash-theme";
const PALETTE_KEY = "emdash-palette";

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

function getStoredPalette(): Palette {
	if (typeof window === "undefined") return "classic";
	const stored = localStorage.getItem(PALETTE_KEY);
	if (PALETTES.some((p) => p.id === stored)) {
		return stored as Palette;
	}
	return "classic";
}

export interface ThemeProviderProps {
	children: React.ReactNode;
	/** Default theme if none stored. Defaults to "system" */
	defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
	const [theme, setThemeState] = React.useState<Theme>(() => {
		const stored = getStoredTheme();
		return stored === "system" ? defaultTheme : stored;
	});

	const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => {
		if (theme === "system") return getSystemTheme();
		return theme;
	});

	const [palette, setPaletteState] = React.useState<Palette>(getStoredPalette);

	// Resolve the effective theme whenever the user preference changes
	React.useEffect(() => {
		if (theme === "system") {
			setResolvedTheme(getSystemTheme());
		} else {
			setResolvedTheme(theme);
		}
	}, [theme]);

	// Listen for OS preference changes when in system mode
	React.useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			setResolvedTheme(e.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [theme]);

	// Sync DOM attributes with the resolved theme and palette.
	// data-mode drives Tailwind dark: utilities via @custom-variant.
	// data-theme selects the visual palette (e.g. "classic", "modern").
	React.useEffect(() => {
		const root = document.documentElement;
		root.setAttribute("data-theme", palette);
		root.setAttribute("data-mode", resolvedTheme);
	}, [resolvedTheme, palette]);

	const setTheme = React.useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	}, []);

	const setPalette = React.useCallback((newPalette: Palette) => {
		setPaletteState(newPalette);
		localStorage.setItem(PALETTE_KEY, newPalette);
	}, []);

	const value = React.useMemo(
		() => ({ theme, setTheme, resolvedTheme, palette, setPalette }),
		[theme, setTheme, resolvedTheme, palette, setPalette],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = React.useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
