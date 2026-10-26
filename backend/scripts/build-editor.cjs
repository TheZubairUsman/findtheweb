const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'dist/assets/js/BlogManager-CgU_iRbw.js');
const bridges = {
  react: 'import {r as React} from "./vendor-D0vOuAIx.js"; export default React; export const {useState,useEffect,useRef}=React;',
  auth: 'export {x as useAuth} from "./index-BLfo3RSv.js";',
};
esbuild.build({
  absWorkingDir:root,
  entryPoints:['frontend-recovered/src/components/admin/BlogManager.jsx'],
  outfile:output, bundle:true, format:'esm', platform:'browser', target:'es2020',
  minify:true, sourcemap:false, legalComments:'none',
  plugins:[{
    name:'existing-runtime-bridges',
    setup(build){
      build.onResolve({filter:/^react$/},()=>({path:'react',namespace:'bridge'}));
      build.onResolve({filter:/hooks\/useAuth$/},()=>({path:'auth',namespace:'bridge'}));
      build.onResolve({filter:/^\.\/(vendor-D0vOuAIx|index-BLfo3RSv)\.js$/},args=>({path:args.path,external:true}));
      build.onLoad({filter:/.*/,namespace:'bridge'},args=>({contents:bridges[args.path],loader:'js'}));
    },
  }],
}).then(()=>{
  const loaderFile = path.join(root, 'dist/assets/js/index-BLfo3RSv.js');
  const loader = fs.readFileSync(loaderFile, 'utf8');
  const pattern = /import\("\.\/BlogManager-CgU_iRbw\.js(?:\?[^"\n]*)?"\)/g;
  if (!pattern.test(loader)) throw new Error('Editor loader import not found');
  fs.writeFileSync(loaderFile, loader.replace(pattern, 'import("./BlogManager-CgU_iRbw.js?v=20261026editorux1")'));
  if(process.argv.includes('--check'))console.log('Editor source compiled successfully');
  else console.log('Built '+path.relative(root,output));
}).catch(error=>{console.error(error.message);process.exitCode=1;});
