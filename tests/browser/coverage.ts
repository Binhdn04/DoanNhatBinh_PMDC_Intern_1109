import {test} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import v8toIstanbul from 'v8-to-istanbul';
import {createCoverageMap} from 'istanbul-lib-coverage';
test.beforeEach(async({page})=>{if(process.env.BROWSER_COVERAGE)await page.coverage.startJSCoverage({resetOnNavigation:false});});
test.afterEach(async({page},info)=>{
 if(!process.env.BROWSER_COVERAGE)return;
 const map=createCoverageMap({});
 for(const entry of await page.coverage.stopJSCoverage()){
  const path=new URL(entry.url).pathname;
  if(!path.startsWith('/src/') || !entry.source || path.endsWith('/main.tsx'))continue;
  const converter=v8toIstanbul(resolve('apps/web',path.slice(1)),0,{source:entry.source});
  await converter.load();converter.applyCoverage(entry.functions);map.merge(converter.toIstanbul());
 }
 await mkdir('apps/web/coverage-browser',{recursive:true});
 await writeFile(`apps/web/coverage-browser/${info.testId.replace(/[^a-z0-9]/gi,'_')}.json`,JSON.stringify(map.toJSON()));
});
