import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type ParsedVault = {
	notes: Map<string, string>;
	links: Map<string, string[]>;
};

const LINK_PATTERNS = [
	/\[\[(.*?)\]\]/g,
	/\[([^\]]+)\]\(([^)]+)\)/g,
	/!\[\[(.*?)\]\]/g,
];

function normalizeLink(raw: string): string {
	return raw.split("|")[0].split("#")[0].trim().toLowerCase();
}

export async function parseVault(vaultDir: string): Promise<ParsedVault> {
	const notes = new Map<string, string>();
	const links = new Map<string, string[]>();

	const entries = await readdir(vaultDir, {
		recursive: true,
		withFileTypes: true,
	});

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

		const parentPath = (entry as { parentPath?: string; path?: string })
			.parentPath ?? (entry as { path?: string }).path ?? vaultDir;
		const filePath = join(parentPath, entry.name);
		const content = await readFile(filePath, "utf8");
		const key = entry.name.toLowerCase();

		notes.set(key, content);

		const fileLinks: string[] = [];
		for (const pattern of LINK_PATTERNS) {
			for (const match of content.matchAll(pattern)) {
				fileLinks.push(normalizeLink(match[1]));
			}
		}
		links.set(key, fileLinks);
	}

	return { notes, links };
}
