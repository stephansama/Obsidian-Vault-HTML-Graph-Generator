#!/usr/bin/env node
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { cli } from "cleye";
import { parseVault } from "./vault.js";
import { getObsidianColors } from "./colors.js";
import { generateGraphData } from "./graph.js";
import { renderHtml } from "./render.js";

async function isDirectory(path: string): Promise<boolean> {
	try {
		return (await stat(path)).isDirectory();
	} catch {
		return false;
	}
}

const argv = cli({
	name: "obsidian-graph",
	flags: {
		directory: {
			type: String,
			alias: "d",
			description: "Path to the Obsidian vault directory",
		},
		output: {
			type: String,
			alias: "o",
			description: "Directory to write vault_graph.html into",
		},
	},
});

const vaultDir = argv.flags.directory && resolve(argv.flags.directory);
const outputDir = argv.flags.output && resolve(argv.flags.output);

if (!vaultDir || !outputDir) {
	console.error("Error: both --directory and --output are required.");
	argv.showHelp();
	process.exit(1);
}

if (!(await isDirectory(vaultDir))) {
	console.error(`Error: --directory is not a directory: ${vaultDir}`);
	process.exit(1);
}

if (!(await isDirectory(outputDir))) {
	console.error(`Error: --output is not a directory: ${outputDir}`);
	process.exit(1);
}

const vault = await parseVault(vaultDir);
const colorGroups = await getObsidianColors(vaultDir);
const { nodes, edges } = generateGraphData(vault, colorGroups);
const outputPath = await renderHtml({ nodes, edges, colorGroups, outputDir });

console.log(outputPath);
