# Season 14 Farming Ledger: Diablo IV Death Awakening

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
- Progress is per-browser, per-device, and per web address. Checking things off on your phone won't show up on your desktop, and the copy saved at one address is invisible to any other address, which is why the handoff below exists.
- Clearing your browser's site data for the page wipes it.
- Use the **Export** button (top right) any time to copy your progress to the clipboard as a small text blob, and **Import** to paste it back in on another browser or device.
- **Take my progress with me**, in the notice at the top, is the one-click version of that for the move to `schillman.se/d4/ledger`. It packs your saved progress into the link it sends you across on, and the new page unpacks it on arrival. Export and Import still work as the manual fallback if anything goes wrong.
- In some in-chat preview sandboxes, `localStorage` may not persist between reloads. Once the file is actually hosted or opened normally in a browser, it will.

## Checking a change

There is no build step and no test framework. Run this before pushing:

```
node test_import.mjs
```

It starts by compiling both inline `<script>` blocks, which is the `node --check`
pass without the temp file: a syntax error in either one leaves the page
rendering an empty list with no console anyone will read.

The rest of it exists because Import takes a
blob from the clipboard and its failure mode is writing rubbish over a season of
progress. It covers the two pure functions behind that button: `parseBackup`,
which validates a pasted blob whole before a single key is written, and
`mergeProgress`, which drops any id that is not on this list. It carries no copy
of the code under test. It slices the pure block out of `index.html` between the
sentinel comments in that file and evaluates it, so breaking the page turns the
test red. No browser, no server, no dependencies. If you move or rename those
sentinels, the test fails loudly rather than passing on nothing. The rest of the
page needs a DOM and is not covered.

It was validated by mutation rather than by passing on the current code: removing
`if(!isKnownId(id)) return;` from `mergeProgress` turns four assertions red. If
you add a check, do the same, otherwise you cannot tell it from a check that
never fires.

The two pure functions are kept byte for byte identical to the deployed copy at
`schillman.se/d4/ledger.html`, which has its own `test_handoff.mjs` covering the
same two plus the fragment decoder that only the deployed copy carries. Change
them here and change them there.
