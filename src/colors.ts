import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type ColorGroup = {
	query: string;
	color: string;
};

function rgbIntToHex(n: number): string {
	return "#" + (n & 0xffffff).toString(16).padStart(6, "0");
}

export async function getObsidianColors(vaultDir: string): Promise<ColorGroup[]> {
	try {
		const raw = await readFile(
			join(vaultDir, ".obsidian", "graph.json"),
			"utf8",
		);
		const config = JSON.parse(raw) as {
			colorGroups?: Array<{ query: string; color: { rgb: number } }>;
		};
		return (config.colorGroups ?? []).map((g) => ({
			query: g.query,
			color: rgbIntToHex(g.color.rgb),
		}));
	} catch {
		return [];
	}
}
