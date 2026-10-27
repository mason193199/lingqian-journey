import {defineConfig} from '@playwright/test';
const port=Number(process.env.PLAYWRIGHT_PORT||5173);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('PLAYWRIGHT_PORT must be a valid unprivileged port');
export default defineConfig({testDir:'tests/browser',timeout:30000,workers:1,use:{baseURL:`http://127.0.0.1:${port}`,launchOptions:{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:`npm run dev -- --port ${port} --strictPort`,url:`http://127.0.0.1:${port}`,reuseExistingServer:process.env.PLAYWRIGHT_REUSE_SERVER==='1'}});
