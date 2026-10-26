const fs = require('fs');
const parser = require('../backend/node_modules/@babel/parser');
const ast = parser.parse(fs.readFileSync('dist/assets/js/index-BLfo3RSv.js', 'utf8'), { sourceType: 'module' });
const values = new Map();
function literal(n) {
  if (!n) throw Error('missing');
  if (['StringLiteral','NumericLiteral','BooleanLiteral'].includes(n.type)) return n.value;
  if (n.type === 'NullLiteral') return null;
  if (n.type === 'Identifier' && values.has(n.name)) return values.get(n.name);
  if (n.type === 'UnaryExpression' && n.operator === '!') return !literal(n.argument);
  if (n.type === 'UnaryExpression' && n.operator === '-') return -literal(n.argument);
  if (n.type === 'ArrayExpression') return n.elements.map(literal);
  if (n.type === 'ObjectExpression') return Object.fromEntries(n.properties.map(p => {
    if(p.type !== 'ObjectProperty' || p.computed) throw Error('nonliteral');
    return [p.key.name ?? p.key.value, literal(p.value)];
  }));
  throw Error(n.type);
}
for(const n of ast.program.body) if(n.type === 'VariableDeclaration') for(const d of n.declarations) {
  try { values.set(d.id.name, literal(d.init)); } catch (_) {}
}
for(const [key,v] of values) if(v && typeof v === 'object') console.log(key, Array.isArray(v) ? `array ${v.length}: ${(JSON.stringify(v[0]) || '').slice(0,180)}` : Object.keys(v).slice(0,12));
if(process.argv.includes('--recover')) {
  const dir = 'frontend-recovered/src/data'; fs.mkdirSync(dir,{recursive:true});
  for(const [name,key] of Object.entries({categories:'Vo',websites:'Uo'})) {
    if(!Array.isArray(values.get(key))) throw Error('Data not recovered: '+name);
    fs.writeFileSync(`${dir}/${name}.json`,JSON.stringify(values.get(key),null,2)+'\n');
  }
}
