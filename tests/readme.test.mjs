import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("the README shows every captured screenshot with alt text", () => {
  const readme = readFileSync("README.md", "utf8");
  const referenced = new Set([...readme.matchAll(/docs\/screenshots\/([\w-]+\.webp)/g)].map(([, name]) => name));
  assert.deepEqual([...referenced].sort(), readdirSync("docs/screenshots").sort());
  for (const [tag] of readme.matchAll(/<img\s[^>]*>/g)) assert.match(tag, /\salt="[^"]+"/, `${tag} needs alt text.`);
  for (const [image, alt] of readme.matchAll(/!\[([^\]]*)\]\(docs\/screenshots\/[^)]+\)/g)) {
    assert.ok(alt.trim(), `${image} needs alt text.`);
  }
});
