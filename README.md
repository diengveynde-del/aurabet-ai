# AURABET AI

Application React + Tailwind au style Afrofuturiste pour paris sportifs assistés par IA.

## Stack
- React + Vite
- Tailwind CSS
- Lucide Icons
- Firebase Auth (Google + Phone) + Firestore

## Fonctionnalités
- Dashboard avec **Aura Score dynamique**.
- Grille live **CAF / EPL** simulée avec cotes évolutives.
- **Aura Advisor** : moteur de confiance (%) recalculé à chaque cycle.
- Wallet multi-devises **XOF / GNF / USDT**.
- Actions de paiement simulées : **Orange Money** et **Wave**.
- Flux de transactions récentes.

## Firebase path
Le helper `userProfileRef` respecte la structure :
`/artifacts/{appId}/users/{userId}/private/profile`

## Variables d'environnement
Copier `.env.example` vers `.env` et renseigner les valeurs Firebase.

## Run local
```bash
npm install
npm run dev
npm run build
```

## Vérifier rapidement
```bash
# Vérifie que package.json est du JSON strict
node scripts/check-package-json.mjs

# Exécute les tests unitaires (sans dépendre de vite)
node --test test/*.test.js
```

## CI + Déploiement GitHub
- Workflow CI : `.github/workflows/ci.yml`
- Workflow déploiement GitHub Pages : `.github/workflows/deploy-pages.yml`

Le déploiement Pages est déclenché sur `push` vers `main`.
Le `base` Vite est injecté automatiquement avec `VITE_APP_BASE=/<repo>/` pendant le build CI.

## Capture UI Afrofuturiste (Playwright)
```bash
# Utilise DEPLOYMENT_URL si défini, sinon https://aurabet-ai.vercel.app
node scripts/capture-afrofuturism.mjs
```

Exemple avec URL spécifique:
```bash
DEPLOYMENT_URL=http://127.0.0.1:5173 node scripts/capture-afrofuturism.mjs
```

Le script produit `aurabet-afrofuturism-capture.png` à la racine du projet.

## Diagnostic Vercel package.json
Si Vercel retourne `Unexpected token '/'` sur `package.json`, vérifier la syntaxe JSON stricte (sans commentaires `//` ou `/** */`) :

```bash
node scripts/check-package-json.mjs
```
