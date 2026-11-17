import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://kode.eus"),
	title: {
		default: "KODE",
		template: "%s · KODE",
	},
	description: "QR kodeak, esteka laburrak eta bio orriak.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="eu">
			<body>{children}</body>
		</html>
	);
}
