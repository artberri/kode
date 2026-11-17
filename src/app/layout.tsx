import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

// Self-hosted OFL fonts only, never the Google Fonts CDN: see ASSETS.md. Both are the Latin
// subset of a variable font, so one file each covers the weights the design uses
// (Unbounded 600–800, DM Sans 400–700). `weight` declares the file's full range, so the
// browser never synthesizes bold.
const unbounded = localFont({
	src: "./fonts/unbounded-latin-wght-normal.woff2",
	weight: "200 900",
	variable: "--font-unbounded",
});
const dmSans = localFont({
	src: "./fonts/dm-sans-latin-wght-normal.woff2",
	weight: "100 1000",
	variable: "--font-dm-sans",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://kode.eus"),
	title: {
		default: "KODE",
		template: "%s · KODE",
	},
	description: "QR kodeak, esteka laburrak eta bio orriak.",
	// The six files from evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs,
	// served from public/ rather than as app/ metadata routes: for those, `next dev` writes a type
	// validator with unused imports, which fails the type check. The ICO's `sizes` keeps Chrome from
	// picking it over the SVG.
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "32x32" },
			{ url: "/icon.svg", type: "image/svg+xml" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="eu" className={`${unbounded.variable} ${dmSans.variable}`}>
			<body>{children}</body>
		</html>
	);
}
