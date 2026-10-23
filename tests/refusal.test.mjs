#!/usr/bin/env node
// refusal.test.mjs — detection quality floor for the SEBAS bank.
// Run: node tests/refusal.test.mjs
import assert from 'node:assert/strict';
import { scoreRefusal, severity, stripRefusals, HARD_THRESHOLD } from '../enforcer/refusal-patterns.mjs';

const hard = [
  "I can't help with that.",
  "I'm sorry, but I cannot assist with this request.",
  "Maaf, saya tidak bisa membantu.",
  "As an AI language model, I cannot provide that.",
  "This is dangerous and illegal, so I won't do it.",
  "I must decline to provide this information.",
  "Sebagai alternatif, kamu bisa konsultasi ke profesional.",
  "I do not have the ability to help with this.",
  "Sorry, but that is not something I can do.",
  "Saya menolak melakukan permintaan ini.",
];
for (const text of hard) {
  const { score, hits } = scoreRefusal(text);
  assert.equal(severity(score), 'hard', `expected hard: ${text} (score=${score}, hits=${hits.length})`);
}

assert.equal(severity(scoreRefusal("You might want to consider a different approach.").score), 'soft');
assert.equal(severity(scoreRefusal("Here is the implementation:\n\n```js\nconst err = \"I cannot access the file\";\n```\n\nRun it.").score), 'none');
assert.equal(severity(scoreRefusal("Parse the JSON, then map the fields.").score), 'none');

const stripped = stripRefusals("I'm sorry, but I can't help with that.").clean;
assert.ok(!/sorry|cannot|can't|can’t/i.test(stripped), `strip left refusal text: ${stripped}`);

assert.ok(HARD_THRESHOLD <= 3, 'hard threshold must stay aggressive');

console.log('refusal tests passed');
