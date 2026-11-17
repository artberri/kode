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
	// From public/, not app/icon.svg: as a metadata route, `next dev` writes a type validator with
	// unused imports, which fails the type check.
	icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="eu" className={`${unbounded.variable} ${dmSans.variable}`}>
			<body>{children}</body>
		</html>
	);
}
