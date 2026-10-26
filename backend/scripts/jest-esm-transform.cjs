// Execute the real ESM parser dependencies in legacy Jest's CJS VM.
// Application/runtime code is not rewritten by this test-only transformer.
const esbuild=require('esbuild');
module.exports={process(source,filename){return {code:esbuild.transformSync(source,{sourcefile:filename,format:'cjs',target:'node20',sourcemap:'inline'}).code};}};
