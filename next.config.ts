import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Allow-list of what the pages load, all same-origin. Review it with docs/SECURITY_HEADERS.md
// whenever a page loads something new (a script, style, font, image or connection) or serves user
// content.
const contentSecurityPolicy = [
	"default-src 'self'",
	// 'unsafe-inline' for the inline scripts Next.js hydrates with; a nonce would make every page
	// dynamic. React needs 'unsafe-eval' only under `next dev`.
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
	"style-src 'self'",
	// data: for the sample QR code, blob: for rasterising and downloading exports.
	"img-src 'self' data: blob:",
	"font-src 'self'",
	"connect-src 'self'",
	"object-src 'none'",
	"base-uri 'none'",
	"form-action 'self'",
	"frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
	poweredByHeader: false,
	headers() {
		return Promise.resolve([
			{
				source: "/:path*",
				headers: [
					{ key: "Content-Security-Policy", value: contentSecurityPolicy },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
					},
				],
			},
		]);
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;

// Exposes Cloudflare bindings to `getCloudflareContext()` while running `next dev`.
void initOpenNextCloudflareForDev();
