import { test, expect } from '@playwright/test';

test.describe('Tukro End-to-End Tests', () => {

    // Generate random email for new user
    const randomStr = Math.random().toString(36).substring(7);
    const testEmail = `user_${randomStr}@test.com`;
    const testUsername = `Test User ${randomStr}`;

    test('Complete Registration, Login, Profile Edit, Community Create, Scrap Send Flow', async ({ page }) => {

        // 1. Visit App
        await page.goto('http://localhost:5173');
        await expect(page).toHaveTitle(/tukro/i); // might fail if title not set, but let's check basic elements

        // 2. Go to Register
        await page.click('text=Crie uma agora');
        await expect(page.locator('.auth-title')).toHaveText('crie sua conta');

        // 3. Fill Registration
        await page.fill('input[type="text"]', testUsername);
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', 'pass1234');
        await page.click('button[type="submit"]');

        // 4. Verify Redirect to Home (Feed)
        await expect(page.locator('.card-header:has-text("Bem-vindo(a)")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('h2').first()).toHaveText(testUsername);

        // 5. Navigate to Profile
        await page.click('nav a:has-text("Perfil")');
        await expect(page.locator('h2').first()).toHaveText(testUsername);

        // 6. Edit Humor
        await page.locator('text=✏️').click();
        await page.fill('.col-center input[type="text"]', 'Sentindo-se Nostálgico');
        await page.click('button:has-text("Salvar")');
        await expect(page.locator('.humor-text').first()).toContainText('Sentindo-se Nostálgico');

        // 7. Find Demo User via Global Search
        await page.fill('input[placeholder="Pesquisar no Tukro..."]', 'demo@');
        await page.waitForSelector('.search-result-item');
        await page.click('.search-result-item');

        // 8. Add Demo User as Friend
        await expect(page.locator('h2').first()).toHaveText('Demo User');
        if (await page.locator('button:has-text("Adicionar Amigo")').isVisible()) {
            await page.click('button:has-text("Adicionar Amigo")');
            await expect(page.locator('button:has-text("Solicitação enviada")')).toBeVisible();
        }

        // 9. Send a Scrap to Demo User
        await page.click('a:has-text("Deixar recado")');
        await page.fill('textarea', 'Olá Demo, este é um recado automático de teste!');
        await page.click('button[type="submit"]');

        // Verify scrap appears in list
        await expect(page.locator('.scrap-text').first()).toHaveText('Olá Demo, este é um recado automático de teste!');

        // 10. Visit Communities & Create One
        await page.click('nav a:has-text("Comunidades")');
        await expect(page.locator('text=Explorar')).toBeVisible();

        await page.click('button:has-text("+ Criar Comunidade")');
        await page.fill('input[placeholder="Nome da comunidade"]', `E2E Testers ${randomStr}`);
        await page.selectOption('select', 'Tecnologia');
        await page.fill('textarea[placeholder="Descrição"]', 'Comunidade criada automaticamente por teste E2E.');
        await page.click('button[type="submit"]:has-text("Criar")');

        // Verify community detail page
        await expect(page.locator('h2')).toHaveText(`E2E Testers ${randomStr}`);
        await expect(page.locator('text=Comunidade criada automaticamente')).toBeVisible();

        // 11. Create a Forum Topic in Community
        await page.click('button:has-text("Novo Tópico")');
        await page.fill('input[placeholder="Título do tópico"]', 'Primeiro Tópico Oficial!');
        await page.fill('textarea[placeholder="Mensagem"]', 'Bem-vindos todos os robôs!');
        await page.click('button[type="submit"]:has-text("Criar Tópico")');

        // Verify topic link appears
        await expect(page.locator('.topic-title')).toHaveText('Primeiro Tópico Oficial!');

        // 12. Messages (Inbox)
        await page.click('a[href="/messages"]');
        await expect(page.locator('.card-header').first()).toHaveText('Minhas Mensagens');

        console.log('Test completed successfully!');
    });
});
