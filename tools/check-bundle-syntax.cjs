// Parse the actual browser ES modules without executing application code.
// Run: node --experimental-vm-modules tools/check-bundle-syntax.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
if (!vm.SourceTextModule) throw new Error('Run with --experimental-vm-modules');
const dir = path.resolve(__dirname, '../dist/assets/js');
let count = 0;
for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.js'))) {
  new vm.SourceTextModule(fs.readFileSync(path.join(dir, name), 'utf8'), {identifier:name});
  count++;
}
console.log(`Parsed ${count} browser modules successfully`);
