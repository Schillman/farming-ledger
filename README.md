# Season 14 Farming Ledger — Diablo IV Death Awakening

A single-file, self-contained checklist for farming Diablo IV's Season 14 (Season of Death Awakening). No build step, no dependencies to install, no backend.

## Deploy it on GitHub Pages

1. Create a new repository (or use an existing one) and add `index.html` to the root.
2. Push it:
   ```
   git add index.html
   git commit -m "Add farming ledger"
   git push
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` and `/ (root)`, save.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

You can also just double-click `index.html` to open it straight in a browser, no server needed, for local use before you ever push it anywhere.

## How progress saving works

Checked items are saved to `localStorage` in your browser, under one key, the moment you click a checkbox. There's no account and nothing is sent anywhere.

That also means:
- Progress is per-browser, per-device. Checking things off on your phone won't show up on your desktop.
- Clearing your browser's site data for the page wipes it.
- Use the **Export** button (top right) any time to copy your progress to the clipboard as a small text blob, and **Import** to paste it back in on another browser or device.
- In some in-chat preview sandboxes, `localStorage` may not persist between reloads. Once the file is actually hosted or opened normally in a browser, it will.
