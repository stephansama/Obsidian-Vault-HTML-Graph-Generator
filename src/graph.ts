import { extname, basename } from "node:path";
import type { ColorGroup } from "./colors.js";
import type { ParsedVault } from "./vault.js";

export type GraphNode = {
	id: string;
	label: string;
	link_count: number;
	color: string;
};

export type GraphEdge = {
	source: string;
	target: string;
};

function capitalizeFirst(s: string): string {
	return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function pickColor(content: string, groups: ColorGroup[]): string {
	for (const group of groups) {
		if (group.query && new RegExp(group.query, "i").test(content)) {
			return group.color;
		}
	}
	return "#7f7f7f";
}

export function generateGraphData(
	vault: ParsedVault,
	colorGroups: ColorGroup[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
	const { notes, links } = vault;
	const linkCount = new Map<string, number>();

	const edges: GraphEdge[] = [];
	for (const [src, targets] of links) {
		linkCount.set(src, (linkCount.get(src) ?? 0) + targets.length);
		for (const dst of targets) {
			const candidates = [
				dst,
				dst + ".md",
				basename(dst, extname(dst)) + ".md",
			];
			for (const candidate of candidates) {
				if (notes.has(candidate)) {
					edges.push({ source: src, target: candidate });
					linkCount.set(candidate, (linkCount.get(candidate) ?? 0) + 1);
					break;
				}
			}
		}
	}

	const nodes: GraphNode[] = [];
	for (const [id, content] of notes) {
		const base = basename(id, extname(id));
		nodes.push({
			id,
			label: capitalizeFirst(base),
			link_count: linkCount.get(id) ?? 0,
			color: pickColor(content, colorGroups),
		});
	}

	return { nodes, edges };
}
