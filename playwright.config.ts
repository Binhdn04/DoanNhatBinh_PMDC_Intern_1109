import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',fullyParallel:false,workers:1,timeout:60000,
 use:{baseURL:'http://127.0.0.1:5175',trace:'retain-on-failure'},
 webServer:[
  {command:'node scripts/e2e-server.mjs',url:'http://127.0.0.1:3005/api/v1/health',timeout:60000,reuseExistingServer:false},
  {command:'pnpm --filter @internhub/web exec vite --host 127.0.0.1 --port 5175',url:'http://127.0.0.1:5175',timeout:30000,reuseExistingServer:false,env:{VITE_API_BASE_URL:'http://127.0.0.1:3005/api/v1'}}
 ]
});
