const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runTest() {
    console.log('Starting Playwright test...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const outDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    try {
        // 1. Visit Login Page
        console.log('Navigating to login...');
        await page.goto('http://localhost:5173');
        await page.waitForSelector('.auth-form');
        await page.screenshot({ path: path.join(outDir, '01_login.png') });

        // 2. Login
        console.log('Logging in...');
        await page.fill('input[type="email"]', 'demo@tukro.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');

        // 3. Wait for Home Page
        console.log('Waiting for Home...');
        await page.waitForTimeout(2000); // Wait for API and React render
        await page.screenshot({ path: path.join(outDir, '02_home.png') });

        // 4. Visit Communities
        console.log('Visiting Communities...');
        await page.click('a[href="/communities"]');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outDir, '03_communities.png') });

        // 5. Visit Profile
        console.log('Visiting Profile...');
        await page.click('a:has-text("Perfil")');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outDir, '04_profile.png') });

        // 6. Visit Messages
        console.log('Visiting Messages...');
        await page.click('a[href="/messages"]');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outDir, '05_messages.png') });

        console.log('All tests passed! Screenshots saved to', outDir);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
}

runTest();
