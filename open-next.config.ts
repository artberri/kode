import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache yet: add the R2 cache when pages need ISR or revalidation.
// See https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
