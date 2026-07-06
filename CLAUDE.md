# CLAUDE.md

## Project

Single-file static site: a Diablo IV Season 14 ("Death Awakening") farming checklist, hosted on GitHub Pages. Zero build step by design — keep it that way. No framework, no bundler, no package.json.

## Architecture

Everything lives in one `index.html`:
- `<style>` — design tokens as CSS custom properties, then component styles.
- First `<script>` — `const DATA = [...]`, 13 categories / 48 items. Each item: `id`, `title`, `detail`, optional `tags`.
- Second `<script>` — an IIFE handling render, filters, and storage.

Progress persists via `localStorage` under the key `d4s14-farming-ledger.v1` (a `{itemId: boolean}` map). Export/Import move that JSON through the clipboard for backup. Deployment steps are in `README.md` — don't duplicate them here.

## Design system rules

- One accent color (`--accent`, ember) for every interactive element. Don't introduce a second one.
- `--legendary` and `--mythic` (rarity colors pulled from the game's own UI) are reserved for the Aspects and Mythic Uniques categories only, as a left-border tag. Not decoration elsewhere.
- Shape scale is fixed: 14px radius on panels, 8px on controls, full pill on chips/toggles. Match it, don't add a new radius.
- Display type is Cinzel, used only for the H1/wordmark. Everything else is Barlow (body) or Barlow Condensed (labels/stats/buttons).
- No em-dashes, no curly quotes, anywhere in copy.

## Before treating any change as done

This project has been through a full accessibility and correctness pass — don't regress it. For any edit that touches color, copy, or the data array:

1. Extract both `<script>` blocks and run `node --check` on each.
2. If a color or background changed, recompute its WCAG contrast ratio (relative-luminance formula, not eyeballing) and confirm it clears 4.5:1 for normal text / 3:1 for large text or graphical objects.
3. Re-grep for em-dashes, curly quotes, and unescaped `&`.
4. Confirm item `id`s are still unique across all categories after any addition.
5. Don't leave unused CSS custom properties or dead selectors behind after a change — if nothing references a token anymore, remove it.

## Content accuracy

Item copy describes real Diablo IV Season 14 mechanics, cross-checked against current sources (Maxroll, Icy Veins, Blizzard patch notes) rather than trusted from memory. Season content is actively patched and terminology drifts. Before adding or editing any item that names a specific mechanic, boss, or drop source, verify it against a current source rather than inferring it — a plausible-sounding invented name is worse than an item that honestly says a detail is unconfirmed.
