# Deployment

This is a static Astro site. The production build command is:

```sh
npm run build
```

The generated site is written to:

```sh
dist
```

## GitHub Pages

GitHub Pages can host this static Astro site directly from GitHub Actions. This repo includes `.github/workflows/deploy.yml`, which builds and deploys the site whenever changes are pushed to `main`.

The workflow file is needed because this is an Astro project: GitHub Pages serves static files, but the source code first needs to run `npm run build` to generate the `dist` output. The workflow handles that build step on GitHub and publishes the generated files.

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

GitHub Pages is available for public repositories on GitHub Free. Private-repository Pages requires a paid GitHub plan, and the published site is still publicly accessible.

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

## Manual fallback

For a quick one-off publish, run `npm run build` and upload the `dist` folder to any static host that supports HTML, CSS, JavaScript, and image files.
