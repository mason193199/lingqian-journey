// Publishes only dist/; leaves the application checkout and its history intact.
import {execFileSync} from 'node:child_process';
import {mkdtemp,cp,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const git=(args,cwd=process.cwd())=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const remote=git(['remote','get-url','origin']);
const sourceCommit=git(['rev-parse','HEAD']);
const identity=git(['var','GIT_AUTHOR_IDENT']).match(/^(.*) <([^>]+)> /);
if(!identity)throw new Error('Git author identity is required');
const existing=git(['ls-remote','--heads','origin','refs/heads/gh-pages']);
const dir=await mkdtemp(join(tmpdir(),'lingqian-pages-'));
try{
 git(['init','--initial-branch=gh-pages',dir]);git(['remote','add','origin',remote],dir);git(['config','user.name',identity[1]],dir);git(['config','user.email',identity[2]],dir);
 if(existing){git(['fetch','--depth=1','origin','gh-pages'],dir);git(['checkout','-B','gh-pages','FETCH_HEAD'],dir);for(const name of await readdir(dir))if(name!=='.git')await rm(join(dir,name),{recursive:true,force:true});}
 await cp('dist',dir,{recursive:true});await writeFile(join(dir,'.nojekyll'),'');await writeFile(join(dir,'version.json'),JSON.stringify({sourceCommit,builtAt:new Date().toISOString()})+'\n');
 git(['add','--all'],dir);git(['commit','--allow-empty','-m',`Deploy Lingqian Journey ${sourceCommit.slice(0,7)}`],dir);git(['push','origin','HEAD:refs/heads/gh-pages'],dir);
 console.log('Production files pushed to gh-pages. Website availability still requires GitHub Pages to be enabled.');
 console.log('Expected URL: https://mason193199.github.io/lingqian-journey/');
}finally{await rm(dir,{recursive:true,force:true});}
