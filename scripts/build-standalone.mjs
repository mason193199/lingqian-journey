import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
let html=await readFile('dist/index.html','utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
for(const [tag,src] of scripts){
 const code=await readFile(resolve('dist',src.replace(/^\//,'')),'utf8');
 html=html.replace(tag,()=>`<script type="module">${code.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for(const [tag] of styles){
 const href=tag.match(/href="([^"]+)"/)[1];
 const css=await readFile(resolve('dist',href.replace(/^\//,'')),'utf8');
 html=html.replace(tag,()=>`<style>${css}</style>`);
}
await writeFile('dist/lingqian-journey.html',html);
console.log('Standalone offline game: dist/lingqian-journey.html');
