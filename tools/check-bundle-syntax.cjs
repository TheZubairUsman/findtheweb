// Parse the actual browser ES modules without executing application code.
// Run: node --experimental-vm-modules tools/check-bundle-syntax.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
if (!vm.SourceTextModule) throw new Error('Run with --experimental-vm-modules');
let count = 0;
for (const directory of ['../dist/assets/js','../dist/assets/frontend']) {
const dir = path.resolve(__dirname, directory);
if (!fs.existsSync(dir)) continue;
for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.js'))) {
  new vm.SourceTextModule(fs.readFileSync(path.join(dir, name), 'utf8'), {identifier:name});
  count++;
}
}
console.log(`Parsed ${count} browser modules successfully`);
