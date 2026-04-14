import { useLingui } from "@lingui/react/macro";
import { Check } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "../lib/utils";
import { PALETTES, useTheme } from "./ThemeProvider";
import type { Palette } from "./ThemeProvider";

/**
 * Visual palette picker — renders a row of swatches showing each
 * palette's sidebar color and accent. Clicking selects it.
 */
export function PalettePicker() {
	const { t } = useLingui();
	const { palette, setPalette } = useTheme();

	return (
		<fieldset>
			<legend className="sr-only">{t`Admin color palette`}</legend>
			<div className="flex gap-3">
				{PALETTES.map((p) => (
					<PaletteSwatch
						key={p.id}
						id={p.id}
						label={p.label}
						sidebar={p.sidebar}
						accent={p.accent}
						active={palette === p.id}
						onSelect={setPalette}
					/>
				))}
			</div>
		</fieldset>
	);
}

function PaletteSwatch({
	id,
	label,
	sidebar,
	accent,
	active,
	onSelect,
}: {
	id: Palette;
	label: string;
	sidebar: string;
	accent: string;
	active: boolean;
	onSelect: (id: Palette) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onSelect(id)}
			className={cn(
				"group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors",
				active ? "bg-kumo-tint" : "hover:bg-kumo-tint/50",
			)}
			aria-pressed={active}
		>
			<div
				className={cn(
					"relative h-10 w-14 rounded-md overflow-hidden border transition-shadow",
					active ? "ring-2 ring-kumo-brand ring-offset-1" : "border-kumo-line",
				)}
			>
				{/* Sidebar strip */}
				<div className="absolute inset-y-0 left-0 w-4" style={{ backgroundColor: sidebar }} />
				{/* Content area */}
				<div className="absolute inset-y-0 left-4 right-0 bg-white flex items-center justify-center">
					{/* Accent dot */}
					<div className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
				</div>
				{/* Check overlay */}
				{active && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/20">
						<Check className="h-4 w-4 text-white" weight="bold" />
					</div>
				)}
			</div>
			<span className={cn("text-xs", active ? "font-medium" : "text-kumo-subtle")}>{label}</span>
		</button>
	);
}
