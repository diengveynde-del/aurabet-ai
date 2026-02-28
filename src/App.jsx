/**
 * AURABET AI - Script de Test & Capture UI Afrofuturiste
 * Version résolue pour les déploiements Vercel et GitHub Actions.
 */

const { chromium } = require('playwright');

(async () => {
  // Définition de l'URL : Priorité à l'URL de déploiement Vercel, sinon fallback local
  const targetUrl = process.env.DEPLOYMENT_URL || 'https://aurabet-ai.vercel.app'; 

  console.log(`🚀 Initialisation du test AuraBet sur : ${targetUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Format iPhone 12 Pro
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await browser.newPage();

  try {
    console.log("📡 Connexion au serveur...");
    const response = await page.goto(targetUrl, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });

    if (!response || response.status() >= 400) {
      throw new Error(`Serveur injoignable (Status: ${response ? response.status() : 'OFFLINE'})`);
    }

    console.log("🧠 Vérification de l'interface (Aura Score)...");
    await page.waitForSelector('text=Aura Score', { timeout: 15000 });

    // Pause pour les animations CSS
    await page.waitForTimeout(2000);

    console.log("📸 Génération de la capture HD...");
    await page.screenshot({ 
      path: 'aurabet-afrofuturism-capture.png', 
      fullPage: false 
    });

    console.log("✅ Capture réussie : aurabet-afrofuturism-capture.png");

  } catch (error) {
    console.error(`❌ ÉCHEC : ${error.message}`);
    if (error.message.includes('ERR_EMPTY_RESPONSE')) {
      console.error("CONSEIL : Le serveur local est indisponible. Définissez DEPLOYMENT_URL.");
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
})();