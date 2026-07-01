# Deployment

This is a static Astro site. The production build command is:

```sh
npm run build
```

The generated site is written to:

```sh
dist
```

## Recommended path: GitHub Pages

GitHub Pages can host this static Astro site directly from GitHub Actions. This repo includes `.github/workflows/deploy.yml`, which builds and deploys the site whenever changes are pushed to `main`.

The repo is configured for the custom domain `widetim.com`:

- `astro.config.mjs` has `site: "https://widetim.com"`
- `public/CNAME` contains `widetim.com`

### Git-based deployment

1. Commit the GitHub Pages workflow and custom-domain file:

```sh
git add .github/workflows/deploy.yml public/CNAME DEPLOYMENT.md
git commit -m "Add GitHub Pages deployment"
```

2. Create a GitHub repository and push this repo.

With GitHub CLI:

```sh
gh auth login -h github.com
gh repo create wide-tim --public --source=. --remote=origin --push
```

If you prefer a private repository, use `--private` instead of `--public`. GitHub Pages is public even when the repository is private.

3. On GitHub, open the repository settings.
4. Go to `Pages`.
5. Set `Source` to `GitHub Actions`.
6. Wait for the `Deploy to GitHub Pages` workflow to finish.
7. In the repository's `Pages` settings, verify that the custom domain is `widetim.com`.
8. In the domain registrar DNS settings, point `widetim.com` to GitHub Pages.

For the apex domain, add these `A` records:

```txt
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

Optionally add these `AAAA` records for IPv6:

```txt
@  AAAA  2606:50c0:8000::153
@  AAAA  2606:50c0:8001::153
@  AAAA  2606:50c0:8002::153
@  AAAA  2606:50c0:8003::153
```

For `www.widetim.com`, add a `CNAME` record pointing to your GitHub Pages default domain:

```txt
www  CNAME  YOUR-GITHUB-USERNAME.github.io
```

Do not include the repository name in the `www` CNAME target.

Future changes can be deployed by committing and pushing to `main`.

## Alternative path: Netlify

Netlify is the simplest fit for this repository because Astro builds to static files and this repo now includes `netlify.toml`.

### Git-based deployment

1. Commit the deployment config:

```sh
git add netlify.toml DEPLOYMENT.md
git commit -m "Add deployment config"
```

2. Create a GitHub repository and push this repo.

With GitHub CLI:

```sh
gh auth login -h github.com
gh repo create wide-tim --public --source=. --remote=origin --push
```

If you prefer a private repository, use `--private` instead of `--public`.

3. In Netlify, create a new site from the GitHub repository.
4. Use these settings if Netlify does not auto-detect them:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add `widetim.com` as the custom domain in Netlify.
6. In the domain registrar DNS settings, point the domain to Netlify using the DNS records Netlify provides.

Future changes can be deployed by committing and pushing to the production branch.

## Manual fallback

For a quick one-off publish, run `npm run build` and upload the `dist` folder to any static host that supports HTML, CSS, JavaScript, and image files.
