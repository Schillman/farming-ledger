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

## A couple of honest caveats

- This was built and reviewed entirely in code, there's no browser available on my end to render and screenshot it, so it's been checked for valid markup, working JavaScript, and WCAG AA color contrast, but not pixel-tested. Open it up and let me know if anything looks off.
- No official Diablo art or screenshots are used anywhere. The look is built entirely from CSS (gradients, a subtle grain texture, type, and color) rather than any Blizzard-owned imagery.
- A few terms in the source video's transcript were garbled by automatic captioning. Terminology and drop-rate details here were corrected against current patch information where possible; a couple of items say outright when something is unconfirmed or was still shifting as of early Season 14, since Blizzard does still tune these numbers mid-season.
