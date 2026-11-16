import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://kode.eus"),
	title: {
		default: "KODE",
		template: "%s · KODE",
	},
	description: "QR codes, short links and bio pages.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
