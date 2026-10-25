#!/usr/bin/env node

// Source maps are the recovery source for this compiled release. This script
// intentionally writes only under frontend-recovered/ and never overwrites dist.
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distJs = path.join(projectRoot, '..', 'dist', 'assets', 'js');
const outputRoot = path.join(projectRoot, '..', 'frontend-recovered');
let recovered = 0;

for (const file of fs.readdirSync(distJs)) {
  if (!file.endsWith('.map')) continue;
  const map = JSON.parse(fs.readFileSync(path.join(distJs, file), 'utf8'));
  map.sources.forEach((source, index) => {
    if (!source.startsWith('../../../src/') || typeof map.sourcesContent?.[index] !== 'string') return;
    const target = path.join(outputRoot, source.replace(/^\.\.\/\.\.\/\.\.\//, ''));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, map.sourcesContent[index], 'utf8');
    recovered += 1;
  });
}

console.log(`Recovered ${recovered} frontend source files under ${outputRoot}`);
