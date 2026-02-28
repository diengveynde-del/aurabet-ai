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

## CI + Déploiement GitHub
- Workflow CI : `.github/workflows/ci.yml`
- Workflow déploiement GitHub Pages : `.github/workflows/deploy-pages.yml`

Le déploiement Pages est déclenché sur `push` vers `main`.
Le `base` Vite est injecté automatiquement avec `VITE_APP_BASE=/<repo>/` pendant le build CI.

### Procédure "git update / deployer / fusionner"
```bash
git add .
git commit -m "chore: update deploy pipeline"
git push
```
Ensuite, ouvrir/mettre à jour la PR GitHub, vérifier CI ✅ puis fusionner.

## Dépannage (403 npm / proxy réseau)
Si `npm install` échoue (`403 Forbidden` ou `ENETUNREACH`), exécuter :

```bash
npm run doctor
```

Puis tester :

```bash
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY npm install
```

Si votre organisation impose un proxy, utilisez un proxy approuvé/configuré avec identifiants valides dans votre `.npmrc`.


## Tests unitaires
```bash
npm run test:unit
```
(Ne dépend pas de l'installation npm complète : utilise le runner natif `node --test`.)


## Capture UI Afrofuturiste (Playwright)
```bash
# Utilise DEPLOYMENT_URL si défini, sinon https://aurabet-ai.vercel.app
npm run capture:ui
```

Exemple avec URL spécifique:
```bash
DEPLOYMENT_URL=http://127.0.0.1:5173 npm run capture:ui
```

Le script produit `aurabet-afrofuturism-capture.png` à la racine du projet.


## Diagnostic Vercel package.json
Si Vercel retourne `Unexpected token '/'` sur `package.json`, vérifier la syntaxe JSON stricte (sans commentaires `//` ou `/** */`) :

```bash
npm run check:package
```
