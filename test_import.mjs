#!/usr/bin/env node
/* Tests the Import path on index.html.
 *
 *     node test_import.mjs
 *
 * No browser, no server, no framework, no dependencies. The rest of that page
 * needs a DOM and is not covered here; this covers the two functions that take a
 * blob from the clipboard and whose failure mode is quietly writing rubbish over
 * a season of someone's progress.
 *
 * It does not carry a copy of the code under test. It slices the pure block out
 * of index.html between the sentinels in that file and evaluates it, so what is
 * asserted on is the shipped source. Break the page and this goes red.
 *
 * The twin of this file is test_handoff.mjs in the schillman.se repo, which
 * slices the same two functions out of the deployed copy of this page and adds
 * the fragment decoder that only the deployed copy has.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const START = "/* --- pure handoff logic, extracted verbatim by test_handoff.mjs --- */";
const END = "/* --- end pure handoff logic --- */";

const page = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const from = page.indexOf(START);
const to = page.indexOf(END);
assert.ok(from !== -1 && to > from,
  "import sentinels not found in index.html, so nothing was tested");

const { parseBackup, mergeProgress } = new Function(
  page.slice(from + START.length, to) +
  "\nreturn { parseBackup: parseBackup, mergeProgress: mergeProgress };")();

const KNOWN = new Set(["esc-1", "esc-2", "esc-3", "esc-4"]);
const isKnownId = id => KNOWN.has(id);

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  PASS  " + name);
  } catch (err) {
    failures++;
    console.log("  FAIL  " + name + "\n        " + String(err.message).split("\n")[0]);
  }
}

console.log("\nboth inline <script> blocks parse");

/* new Function compiles without running, which is what node --check does to a
   script body, minus the temp file. A syntax error in either block leaves the
   page rendering an empty list with no console anyone will read, so it is worth
   one assertion rather than a step in the README nobody runs. */
const blocks = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)];
test("there are two of them", () => assert.equal(blocks.length, 2));
blocks.forEach(([, body], i) =>
  test(`block ${i + 1} compiles`, () => new Function(body)));

console.log("\nmergeProgress, last write wins per item key");

test("an incoming key overwrites the local value", () => {
  const local = { "esc-1": true, "esc-2": true };
  assert.equal(mergeProgress(local, { "esc-2": false }, isKnownId), 1);
  assert.deepEqual(local, { "esc-1": true, "esc-2": false });
});

test("a local key the blob does not mention survives", () => {
  const local = { "esc-1": true, "esc-4": true };
  assert.equal(mergeProgress(local, { "esc-2": false, "esc-3": true }, isKnownId), 2);
  assert.deepEqual(local, { "esc-1": true, "esc-4": true, "esc-2": false, "esc-3": true });
});

test("false is carried across as a value, not skipped as falsy", () => {
  const local = { "esc-1": true };
  assert.equal(mergeProgress(local, { "esc-1": false }, isKnownId), 1);
  assert.equal(local["esc-1"], false);
});

test("an id that is not on this list is ignored and not counted", () => {
  const local = { "esc-1": true };
  assert.equal(mergeProgress(local, { "not-an-item": true, "esc-2": true }, isKnownId), 1);
  assert.deepEqual(local, { "esc-1": true, "esc-2": true });
});

console.log("\nparseBackup, blobs pasted into the Import prompt");

/* Import is parseBackup and then mergeProgress, and the bug being pinned here is
   that it used to be neither: it wrote every key it was handed straight into
   storage. So the assertions run the pair, the way the click handler does, and
   check both what landed in storage and the two numbers the toast reports. */
function importBlob(local, raw) {
  const incoming = parseBackup(raw);
  const offered = Object.keys(incoming).length;
  const restored = mergeProgress(local, incoming, isKnownId);
  return { restored, skipped: offered - restored };
}

test("a blob of nothing but known ids restores all of them", () => {
  const local = {};
  const counts = importBlob(local, JSON.stringify({ "esc-1": true, "esc-2": false, "esc-3": true }));
  assert.deepEqual(local, { "esc-1": true, "esc-2": false, "esc-3": true });
  assert.deepEqual(counts, { restored: 3, skipped: 0 });
});

test("a blob mixing known and unknown ids stores only the known ones", () => {
  /* The reported bug exactly: an id from an old season, a typo and a hand
     edited key all used to be written to storage and then never render. */
  const local = {};
  const counts = importBlob(local, JSON.stringify({
    "esc-1": true, "s13-legacy": true, "esc-2": true, "esc-1 ": true, "": true
  }));
  assert.deepEqual(local, { "esc-1": true, "esc-2": true },
    "an id that is not on this list reached storage");
  assert.deepEqual(counts, { restored: 2, skipped: 3 });
});

test("a blob of entirely unknown ids writes nothing at all", () => {
  const local = { "esc-1": true };
  const counts = importBlob(local, JSON.stringify({ "nope": true, "old-1": false }));
  assert.deepEqual(local, { "esc-1": true },
    "storage was touched by a blob with nothing on this list");
  assert.deepEqual(counts, { restored: 0, skipped: 2 });
});

test("values are coerced, so a hand edited 1/0 backup still restores", () => {
  const local = {};
  assert.deepEqual(importBlob(local, '{"esc-1":1,"esc-2":0}'), { restored: 2, skipped: 0 });
  assert.deepEqual(local, { "esc-1": true, "esc-2": false });
});

test("prototype keys are ignored like any other unknown id", () => {
  const local = {};
  importBlob(local, '{"__proto__":true,"constructor":true}');
  assert.deepEqual(local, {});
  assert.equal(({}).__proto__, Object.prototype,
    "Object.prototype was reachable through a backup");
});

console.log("\nparseBackup, malformed input that must throw before anything is written");

/* Each of these throws, so the click handler takes its catch branch, shows the
   failure toast and never reaches mergeProgress, saveState or storage. */
const rejects = (name, raw) =>
  test(name, () => assert.throws(() => parseBackup(raw)));

rejects("not JSON at all", "not json");
rejects("truncated JSON", '{"esc-1":true,"esc-2":fal');
rejects("a trailing comma", '{"esc-1":true,}');
rejects("an array", '["esc-1","esc-2"]');
/* An array of strings is already caught by JSON shape alone. An array of
   booleans is the one that needs Array.isArray: without that guard it parses
   cleanly and merges as the keys "0" and "1", which is what this page used to
   write to storage. */
rejects("an array of booleans, which nothing else would catch", "[true,false]");
rejects("a bare number", "42");
rejects("a bare string", '"esc-1"');
rejects("null", "null");
rejects("an empty blob", "");

test("a blob that goes bad partway through writes nothing, not a prefix of itself", () => {
  /* parseBackup builds a whole object before returning, so there is no state to
     roll back: the merge is never reached. This is the half apply case. */
  const local = { "esc-1": false };
  assert.throws(() => importBlob(local, '{"esc-1":true,"esc-2":true'));
  assert.deepEqual(local, { "esc-1": false });
});

console.log(failures ? `\n${failures} FAILURE(S)` : "\nall import tests passed");
process.exit(failures ? 1 : 0);
