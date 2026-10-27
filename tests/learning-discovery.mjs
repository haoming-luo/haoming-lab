import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Keep translated teaching pages discoverable without changing their visible UI.
const base = 'https://lab.haoming-luo.com/learn/';
const variants = [['zh-CN', 'index.html', base], ['en', 'en.html', base + 'en.html'], ['fr', 'fr.html', base + 'fr.html']];
const sitemap = await readFile('public/sitemap.xml', 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(locations).size, locations.length, 'Duplicate sitemap URL');
for (const [language, file, url] of variants) {
  assert(locations.includes(url), `Missing ${language} teaching page in sitemap`);
  const page = await readFile('public/learn/' + file, 'utf8');
  const head = page.split('</head>')[0];
  assert(head.includes(`<html lang="${language}">`));
  assert(head.includes(`<link rel="canonical" href="${url}">`), `Wrong canonical for ${language}`);
  for (const [alternate, , href] of variants) {
    assert(head.includes(`<link rel="alternate" hreflang="${alternate}" href="${href}">`), `Missing ${alternate} alternate in ${language}`);
  }
  assert(!/noindex/i.test(head), `Teaching page ${language} must remain indexable`);
}
const robots = await readFile('public/robots.txt', 'utf8');
assert(robots.includes('Sitemap: https://lab.haoming-luo.com/sitemap.xml'));
console.log('Teaching discovery PASS: three sitemap entries, self-canonicals and reciprocal language links.');
