# Deployment

KODE runs as one Cloudflare Worker, built with OpenNext, on the Workers free plan. The `deploy` job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) deploys every push to `main` once the QA job passes. Pull requests are checked but never deployed.

What the Worker needs lives in [`wrangler.jsonc`](../wrangler.jsonc): the custom domain `kode.eus`, and later its bindings (D1, KV, R2). Deploying creates the domain's DNS record and certificate. The `workers.dev` and preview URLs are off, so the site has a single address.

## One-time setup

These live outside the repository, in the Cloudflare dashboard and the GitHub repository settings. Do them once, before the first deploy.

1. **API token.** Use an account-owned token, so the deploy doesn't depend on any one user: _Manage Account → Account API Tokens → Create Token_. It needs Account → Workers Scripts → Edit, and Zone → Workers Routes → Edit on `kode.eus` (to attach the custom domain); the **Edit Cloudflare Workers** template covers both. A token scoped to the single `kode` Worker can't create it, so only narrow the token that way once the Worker exists.
2. **GitHub secrets.** In the repository, go to _Settings → Environments_ and create a `production` environment. Add two secrets to it: `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID` (shown on the account's _Workers & Pages_ overview). To deploy only from `main`, set the environment's deployment branches to `main`.
3. **Apex record.** The first deploy fails if `kode.eus` already has a CNAME record. Delete any existing apex record in _DNS → Records_ before that deploy.
4. **`www` redirect.** A custom domain answers only its exact hostname, so `www.kode.eus` needs two things in the `kode.eus` zone:
    - a proxied DNS record for `www`: type `AAAA`, content `100::`. Requests never reach that address.
    - a redirect rule (_Rules → Redirect Rules_, or the "Redirect from WWW to root" template): requests to `www.kode.eus` get a 301 to `https://kode.eus` with the same path, and the query string is kept.

## Deploying by hand

`bun run deploy` builds and deploys from your machine, with the credentials from `wrangler login`. Use it only when CI can't deploy: every deploy should come from a commit on `main`.
