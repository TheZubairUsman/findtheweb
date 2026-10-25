#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..', 'src');
const files = [];
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name.endsWith('.js')) files.push(fullPath);
  }
};
visit(root);

const failures = files.filter((file) => spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' }).status !== 0);
if (failures.length) {
  console.error(`Syntax check failed for ${failures.length} file(s).`);
  process.exit(1);
}
console.log(`Syntax check passed for ${files.length} backend source files.`);
