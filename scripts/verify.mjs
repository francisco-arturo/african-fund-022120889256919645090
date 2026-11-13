import assert from "node:assert/strict";
import path from "node:path";
import vm from "node:vm";
import { once } from "node:events";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createApp } from "../dev-server.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(ROOT, "..");
const read = (name) => readFile(path.join(PROJECT, name), "utf8");

function uniqueIds(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.equal(duplicates.length, 0, `Duplicate HTML ids: ${[...new Set(duplicates)].join(", ")}`);
  return ids;
}

function checkMarkup(html) {
  uniqueIds(html);
  for (const required of ["hero-title", "stories-title", "ledger-title", "give-dialog", "fund-desk", "ledger-body"]) {
    assert.ok(html.includes(`id="${required}"`), `Missing required id: ${required}`);
  }
  for (const phrase of ["Small paychecks", "Fund desk", "Download CSV", "Join the $5 table", "SoFi payroll", "PayPal", "Stripe"]) {
    assert.ok(html.includes(phrase), `Missing required content: ${phrase}`);
  }

  const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(imageTags.length >= 4, "Expected at least four story or hero images");
  for (const tag of imageTags) {
    assert.ok(/\balt="[^"]+"/.test(tag), `Image is missing descriptive alt text: ${tag.slice(0, 80)}`);
    assert.ok(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `Image is missing width and height: ${tag.slice(0, 80)}`);
  }

  const svgTags = [...html.matchAll(/<svg\b[^>]*>/g)].map((match) => match[0]);
  for (const tag of svgTags) {
    assert.ok(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `Inline SVG is missing explicit size: ${tag}`);
  }

  const localRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => !ref.startsWith("#") && !ref.startsWith("http") && !ref.startsWith("mailto:") && !ref.startsWith("tel:") && !ref.startsWith("data:"));
  return { localRefs, imageTags };
}

async function checkLocalFiles(localRefs) {
  for (const ref of localRefs) {
    const clean = ref.split("?")[0];
    const target = path.resolve(PROJECT, clean);
    assert.ok(target.startsWith(PROJECT + path.sep), `Local reference escapes the project: ${ref}`);
    const info = await stat(target).catch(() => null);
    assert.ok(info && info.isFile(), `Missing local file referenced by HTML: ${ref}`);
  }
}

function checkScripts(...sources) {
  for (const [name, source] of sources) {
    assert.ok(source.length > 100, `${name} looks empty`);
    new vm.Script(source, { filename: name });
  }
}

async function checkCss(css) {
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  assert.equal(open, close, `CSS has unbalanced braces (${open} open, ${close} close)`);
  for (const token of ["--paper", "--ink", "--accent", "--forest", "--font-display", "--font-body"]) {
    assert.ok(css.includes(token), `Missing design token: ${token}`);
  }
  assert.ok(css.includes("overflow-x: clip"), "The page must use overflow-x: clip");
  assert.ok(css.includes("prefers-reduced-motion"), "Missing the reduced-motion fallback");
  assert.ok(!css.includes("transition: all"), "Never use transition: all");
}

async function checkRoutes() {
  const server = createApp();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  try {
    for (const route of ["/", "/styles.css", "/app.js", "/assets/photos/playing-in-the-nuba-mountains-1920.jpg"]) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, `Route ${route} returned ${response.status}`);
      assert.ok(Number(response.headers.get("content-length")) > 0, `Route ${route} returned an empty body`);
    }
    const home = await (await fetch(base + "/")).text();
    assert.ok(home.includes("Umoja"), "The home route does not render the Umoja page");
    const missing = await fetch(base + "/does-not-exist");
    assert.equal(missing.status, 404, "Unknown routes must return 404");
  } finally {
    server.close();
  }
}

async function main() {
  const html = await read("index.html");
  const css = await read("styles.css");
  const js = await read("app.js");

  const { localRefs } = checkMarkup(html);
  await checkLocalFiles(localRefs);
  await checkCss(css);
  checkScripts(["app.js", js]);
  await checkRoutes();

  console.log("Markup: required sections, duplicate ids, alt text, image dimensions and local assets check out.");
  console.log("Styles: tokens present, braces balanced, overflow-x clip and reduced motion present.");
  console.log("Scripts: app.js parses successfully and dev-server.mjs loaded as an ES module.");
  console.log("Routes: /, /styles.css, /app.js and the hero image return 200; unknown routes return 404.");
  console.log("Verification passed.");
}

main().catch((error) => {
  console.error("Verification failed:", error.message);
  process.exitCode = 1;
});
