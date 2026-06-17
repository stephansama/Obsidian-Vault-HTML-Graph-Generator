# Obsidian-Vault-HTML-Graph-Generator

Generate an interactive, offline-ready D3 graph view of your Obsidian vault as a single HTML file.

## Important Information

**Current Limitations**: At present, the graph only supports Obsidian's graph view `#tag` filters and colors. Any other filters set in Obsidian's graph view will be ignored. This tool only generates the graph view; note contents will not be accessible from the graph.

## Overview

The Obsidian-Vault-HTML-Graph-Generator walks an Obsidian vault, extracts the links between notes (`[[wikilinks]]`, markdown links, and `![[embeds]]`), reads color groups from the vault's `.obsidian/graph.json`, and writes a self-contained HTML file. D3 is inlined into the output, so the HTML is fully portable — share it, host it, or open it directly from disk with no network access.

## Features

- **Interactive HTML Graph**: D3 force-directed graph with zoom, pan, drag, and label collision.
- **Offline-ready**: D3 is bundled into the output; the file works without an internet connection.
- **Obsidian color groups**: Honors `.obsidian/graph.json` `colorGroups`.
- **Catppuccin Mocha** theme for the rendered HTML.
- **CLI**: Two flags, `--directory` and `--output`.

## Usage

Requires Node.js ≥ 20 and pnpm.

```sh
pnpm install
pnpm dev -- --directory /path/to/vault --output /path/to/output-dir
```

Or build a distributable JS bundle:

```sh
pnpm build
node dist/index.js --directory /path/to/vault --output /path/to/output-dir
```

The generated file lands at `<output>/vault_graph.html`.

### Flags

| Flag                   | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `-d, --directory <dir>` | Path to the Obsidian vault directory                |
| `-o, --output <dir>`    | Directory to write `vault_graph.html` into          |

## Contribution

Pull requests and issues are welcome.

## Support

The original Python implementation was authored by [oscarch](https://buymeacoffee.com/oscarch). If you find this tool useful, consider supporting the original author.
