# Footguns

Non-obvious pitfalls in this codebase: code that passes review and type checks but misbehaves at runtime. Each entry shows the wrong way, what happened, and the right way.

Add an entry when you lose real time to a subtle bug the next person would also hit. Keep each heading a short description of the trap, so a reviewer can scan the headings and read only the entries that match what a change touches.

## `cacheComponents` builds fine but hangs every request on Cloudflare

`create-next-app` turns on `cacheComponents` by default. With `@opennextjs/cloudflare` 1.20, `next build` and `opennextjs-cloudflare build` both succeed, and `next dev` works, but the Worker can't serve a page.

**Wrong**

```ts
const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
};
```

On `bun run preview`, the first request hung until `workerd` cancelled it, and every later one returned 500 with "This promise was created by a request that has since ended". Changing the compatibility date or the incremental cache override did not help.

**Right**

```ts
const nextConfig: NextConfig = {
	// cacheComponents stays off until OpenNext supports it on workerd.
};
```

Before turning it on after an OpenNext upgrade, run `bun run preview` and request a page.

## `cf-typegen` after a build breaks CI's type check

`wrangler types` looks for the Worker's entry point, `.open-next/worker.js`, and types it when a build left it on disk.

**Wrong**

```sh
bun run preview      # leaves .open-next/ behind
bun run cf-typegen
```

`cloudflare-env.d.ts` gained a reference to the build output:

```ts
interface GlobalProps {
	mainModule: typeof import("./.open-next/worker");
}
```

`.open-next/` is git-ignored, so the type check passes locally and fails in CI, where nothing has been built.

**Right**

```sh
rm -rf .open-next && bun run cf-typegen
```

Then check that the diff of `cloudflare-env.d.ts` doesn't mention `.open-next`.
