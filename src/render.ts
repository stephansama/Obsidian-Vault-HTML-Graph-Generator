import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import Handlebars from "handlebars";
import type { ColorGroup } from "./colors.js";
import type { GraphEdge, GraphNode } from "./graph.js";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

async function loadTemplate(): Promise<HandlebarsTemplateDelegate> {
	for (const candidate of [
		join(here, "..", "templates", "graph.html.hbs"),
		join(here, "..", "..", "templates", "graph.html.hbs"),
	]) {
		try {
			const src = await readFile(candidate, "utf8");
			return Handlebars.compile(src);
		} catch {
			// try next candidate
		}
	}
	throw new Error("Could not locate templates/graph.html.hbs");
}

async function loadD3Source(): Promise<string> {
	const d3EntryPath = require.resolve("d3");
	const d3PkgRoot = join(d3EntryPath, "..", "..", "..");
	const d3Min = join(d3PkgRoot, "d3", "dist", "d3.min.js");
	return readFile(d3Min, "utf8");
}

async function loadClientScript(): Promise<string> {
	for (const candidate of [
		join(here, "client", "graph.client.js"),
		join(here, "..", "dist", "client", "graph.client.js"),
	]) {
		try {
			const raw = await readFile(candidate, "utf8");
			return raw.replace(/^\s*export\s*\{\s*\}\s*;?\s*$/m, "");
		} catch {
			// try next candidate
		}
	}
	throw new Error(
		"Compiled client script not found. Run 'pnpm build:client' (or 'pnpm build').",
	);
}

export type RenderInput = {
	nodes: GraphNode[];
	edges: GraphEdge[];
	colorGroups: ColorGroup[];
	outputDir: string;
};

export async function renderHtml(input: RenderInput): Promise<string> {
	const template = await loadTemplate();
	const d3Source = await loadD3Source();
	const clientScript = await loadClientScript();

	const html = template({
		d3Source,
		clientScript,
		nodesJson: JSON.stringify(input.nodes),
		edgesJson: JSON.stringify(input.edges),
		colorGroupsJson: JSON.stringify(input.colorGroups),
	});

	await mkdir(input.outputDir, { recursive: true });
	const outputPath = resolve(input.outputDir, "vault_graph.html");
	await writeFile(outputPath, html, "utf8");
	return outputPath;
}
