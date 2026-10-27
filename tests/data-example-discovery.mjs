import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page = readFileSync(new URL('../public/open-science/index.html', import.meta.url), 'utf8');
const language = readFileSync(new URL('../public/open-science/language.js', import.meta.url), 'utf8');
const section = page.match(/<section class="build" id="data-examples"[\s\S]*?<\/section>/)?.[0];
assert.ok(section, 'Examples have a stable direct-link target');
const links = [...section.matchAll(/href="([^"]+)" data-i18n="([^"]+)"/g)];
assert.equal(links.length, 4);
assert.equal(new Set(links.map(m => m[1])).size, 4);
for (const [,href,key] of links) {
  assert.equal(new URL(href).origin, 'https://huggingface.co');
  assert.ok(language.includes(`${key}:`), `${key} has a Chinese label`);
}
for (const key of ['examplesTitle', 'examplesText']) assert.ok(language.includes(`${key}:`));
assert.ok(section.includes('No simulation run or model training required.'));
console.log('Four bilingual, distinct data-example entry points verified.');
