import type { Metadata } from "next";
import { DM_Sans, Unbounded } from "next/font/google";

import "./globals.css";

// Both are variable fonts: one file each covers the weights the design uses
// (Unbounded 600–800, DM Sans 400–700).
const unbounded = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--font-unbounded" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans" });

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
