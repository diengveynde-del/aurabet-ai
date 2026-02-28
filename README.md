/**
 * AURABET AI - Script de Test & Capture UI Afrofuturiste
 * * Ce script utilise Playwright pour valider le rendu de l'interface
 * et générer une capture d'écran haute définition du tableau de bord.
 */

const { chromium } = require('playwright');

(async () => {
  // Définition de l'URL : Priorité à l'URL de déploiement Vercel, sinon fallback local
  // Utilisation : DEPLOYMENT_URL=https://mon-app.vercel.app node test_aurabet.js
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

  // Simulation d'un appareil mobile moderne (iPhone 12 Pro) pour tester le responsive
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/104.1'
  });

  const page = await browser.newPage();

  try {
    console.log("📡 Connexion au serveur...");
    
    // Tentative de navigation avec gestion des erreurs réseau
    const response = await page.goto(targetUrl, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });

    if (!response || response.status() >= 400) {
      throw new Error(`Le serveur a répondu avec le statut ${response ? response.status() : 'NULL'}`);
    }

    // Validation de l'UI : On attend que l'IA Aura Advisor soit chargée
    console.log("🧠 Vérification des composants IA (Aura Score)...");
    await page.waitForSelector('text=Aura Score', { timeout: 15000 });

    // Petit délai supplémentaire pour laisser les animations CSS "glassmorphism" se stabiliser
    await page.waitForTimeout(2000);

    console.log("📸 Capture d'écran en cours (Format HD)...");
    
    await page.screenshot({ 
      path: 'aurabet-afrofuturism-capture.png', 
      fullPage: false // On capture uniquement le viewport mobile pour plus de clarté
    });

    const title = await page.title();
    console.log(`✅ Succès ! Titre détecté : ${title}`);
    console.log("Fichier généré : aurabet-afrofuturism-capture.png");

  } catch (error) {
    console.error(`❌ ÉCHEC DU TEST : ${error.message}`);
    
    if (error.message.includes('ERR_EMPTY_RESPONSE') || error.message.includes('ECONNREFUSED')) {
      console.error("\n💡 CONSEIL DE DÉPANNAGE :");
      console.error("Le serveur local (127.0.0.1) n'est pas accessible dans cet environnement.");
      console.error("Assurez-vous que 'npm run dev' tourne ou utilisez l'URL de production :");
      console.error(`DEPLOYMENT_URL=https://aurabet-ai.vercel.app node ${__filename}\n`);
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

/**
 * RÉSUMÉ DE LA STACK AURABET AI (Documentation intégrée)
 * --------------------------------------------------
 * Fonctionnalités : Aura Score dynamique, Aura Advisor (%), Wallet XOF/GNF/USDT.
 * Firebase : /artifacts/{appId}/users/{userId}/private/profile
 * Déploiement : GitHub Actions + Vercel.
 * Dépannage Proxy : env -u http_proxy -u https_proxy npm install
 */