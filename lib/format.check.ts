// Self-check for the money formatters. No framework: run it with
//   node lib/format.check.ts
// Node strips the types itself. It exits non-zero on the first failure.
import assert from "node:assert";
// Explicit extension: Node's own resolver, not the bundler's.
import { caretAfterDigits, commify, groupDigits, stripGroups } from "./utils.ts";

// commify normalises: it is for figures that are already final.
assert.equal(commify(1793131), "1,793,131");
assert.equal(commify("51230.23"), "51,230.23");
// The orphan trailing zero that had the tx list rendering "45.0".
assert.equal(commify("45.00"), "45");
assert.equal(commify("1390.00"), "1,390");
assert.equal(commify("1.50"), "1.5");
assert.equal(commify("0.28769"), "0.28769");
assert.equal(commify(0), "0");

// groupDigits only inserts separators, so every half-typed state survives.
assert.equal(groupDigits("1793131"), "1,793,131");
assert.equal(groupDigits("1111"), "1,111");
assert.equal(groupDigits("999"), "999");
assert.equal(groupDigits(""), "");
assert.equal(groupDigits("1."), "1."); // mid-decimal, must not lose the point
assert.equal(groupDigits("1.50"), "1.50"); // trailing zero is still being typed
assert.equal(groupDigits("007"), "007"); // leading zeros are the user's business
assert.equal(groupDigits("1234.5678"), "1,234.5678"); // only the whole part groups

// The split that matters: a token quantity drops its noise zeros, money never
// drops its cents. Sending currency through commify is the bug this guards.
assert.equal(commify("45.00"), "45"); // 45 ICY
assert.equal(groupDigits((12276).toFixed(2)), "12,276.00"); // $12,276.00
assert.equal(groupDigits((12276.1).toFixed(2)), "12,276.10");
assert.equal(groupDigits((1.0432).toFixed(4)), "1.0432");

assert.equal(stripGroups("1,793,131"), "1793131");
assert.equal(stripGroups("1793131"), "1793131");

// The caret is pinned by digit index, so it survives separators moving.
assert.equal(caretAfterDigits("1,793,131", 0), 0);
assert.equal(caretAfterDigits("1,793,131", 1), 1); // after "1"
assert.equal(caretAfterDigits("1,793,131", 4), 5); // "1,793|,131", before the comma
assert.equal(caretAfterDigits("1,793,131", 7), 9); // end
assert.equal(caretAfterDigits("1,793,131", 99), 9); // never past the end

// Typing "1" into the middle of "1,111" must leave the caret after that digit,
// not at the end. Caret was at char 3 ("1,1|11"), which is 2 digits in.
{
  const typed = "1,11" + "1" + "1"; // what the DOM holds mid-keystroke
  const raw = stripGroups(typed);
  assert.equal(raw, "11111");
  assert.equal(groupDigits(raw), "11,111");
  assert.equal(caretAfterDigits("11,111", 3), 4); // "11,1|11"
}

console.log("format.check: all assertions passed");
