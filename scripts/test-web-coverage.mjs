import {spawn} from 'node:child_process';
import {readFile,readdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import coverage from 'istanbul-lib-coverage';
import report from 'istanbul-lib-report';
import reports from 'istanbul-reports';
const run=(args)=>new Promise((resolve,reject)=>{const child=spawn('pnpm',args,{stdio:'inherit',env:{...process.env,BROWSER_COVERAGE:'1'}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Command failed (${code}): pnpm ${args.join(' ')}`)));});
await rm('apps/web/coverage-browser',{recursive:true,force:true});
await run(['--filter','@internhub/web','test:coverage']);
await run(['test:browser']);
const map=coverage.createCoverageMap(JSON.parse(await readFile('apps/web/coverage/coverage-final.json','utf8')));
for(const file of await readdir('apps/web/coverage-browser'))map.merge(JSON.parse(await readFile(`apps/web/coverage-browser/${file}`,'utf8')));
const prefix=resolve('apps/web/src')+'/';
map.filter(file=>file.startsWith(prefix) && !file.endsWith('/main.tsx'));
const context=report.createContext({dir:'apps/web/coverage-combined',coverageMap:map});
for(const type of ['text','json','html'])reports.create(type).execute(context);
const summary=map.getCoverageSummary().toJSON();
for(const metric of ['statements','branches','functions','lines'])if(summary[metric].pct<80){console.error(`Combined web ${metric}: ${summary[metric].pct}% (required 80%)`);process.exitCode=1;}
