/**
 * AURABET AI - Script de Test & Capture UI Afrofuturiste
 * Version résolue pour les déploiements Vercel et GitHub Actions.
 */

import { chromium } from 'playwright';

const targetUrl = process.env.DEPLOYMENT_URL || 'https://aurabet-ai.vercel.app';

const run = async () => {
  console.log(`🚀 Initialisation du test AuraBet sur : ${targetUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Format iPhone 12 Pro
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15',
  });

  const page = await context.newPage();

  try {
    console.log('📡 Connexion au serveur...');
    const response = await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response || response.status() >= 400) {
      throw new Error(`Serveur injoignable (Status: ${response ? response.status() : 'OFFLINE'})`);
    }

    console.log("🧠 Vérification de l'interface (Recherche de texte)...");

    try {
      await page.waitForSelector('text=AURA', { timeout: 15000 });
    } catch {
      console.log("⚠️ Texte 'AURA' non trouvé, tentative avec 'XOF'...");
      await page.waitForSelector('text=XOF', { timeout: 10000 });
    }

    await page.waitForTimeout(2000);

    console.log('📸 Génération de la capture HD...');
    await page.screenshot({
      path: 'aurabet-afrofuturism-capture.png',
      fullPage: false,
    });

    console.log('✅ Capture réussie : aurabet-afrofuturism-capture.png');
  } catch (error) {
    console.error(`❌ ÉCHEC : ${error.message}`);

    if (error.message.includes('ERR_EMPTY_RESPONSE')) {
      console.error('CONSEIL : Le serveur local est indisponible. Définissez DEPLOYMENT_URL.');
    }

    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
};

run();
