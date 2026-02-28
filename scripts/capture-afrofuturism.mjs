import { chromium } from 'playwright';

const targetUrl = process.env.DEPLOYMENT_URL || 'https://aurabet-ai.vercel.app';

const run = async () => {
  console.log(`Lancement du test sur : ${targetUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('text=Aura Score', { timeout: 10000 });

    console.log('Page chargée avec succès. Capture d\'écran en cours...');

    await page.screenshot({
      path: 'aurabet-afrofuturism-capture.png',
      fullPage: true,
    });

    const title = await page.title();
    console.log(`Titre de la page : ${title}`);
  } catch (error) {
    console.error(`Échec de la capture : ${error.message}`);

    if (error.message.includes('ERR_EMPTY_RESPONSE')) {
      console.error("CONSEIL : Le serveur local n'est pas accessible. Utilisez l'URL de production Vercel.");
    }

    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
};

run();
