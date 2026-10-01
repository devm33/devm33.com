import assert from "node:assert/strict";
import test from "node:test";
import { transform } from "./math.mjs";

test("renders inline and display math outside code", () => {
  const result = transform(
    "Inline $x + 1$ and $$y$$.\n\n$$\nz = 3\n$$\n\n`$code$`\n",
  );

  assert.equal(result.hasMath, true);
  assert.doesNotMatch(result.body, /\$x \+ 1\$|\$\$y\$\$|\$\$\nz = 3\n\$\$/);
  assert.match(result.body, /<math/);
  assert.match(result.body, /`\$code\$`/);
});

test("ignores escaped delimiters and documents without math", () => {
  const escaped = transform(String.raw`Price: \$5`);
  assert.equal(escaped.hasMath, false);
  assert.equal(escaped.body, String.raw`Price: \$5`);

  const plain = transform("No formulas here.");
  assert.deepEqual(plain, { body: "No formulas here.", hasMath: false });
});
