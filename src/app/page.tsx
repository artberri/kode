import type { Metadata } from "next";

import { designQrCode } from "@/qr-code/application/design-qr-code";
import { DEFAULT_DESIGN } from "@/qr-code/domain/qr-design";
import { QrcodeGeneratorEncoder } from "@/qr-code/infrastructure/qrcode-generator-encoder";
import { QrGenerator } from "@/qr-code/infrastructure/ui/qr-generator";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { QrSticker } from "@/shared/ui/qr-sticker";
import { Stamp } from "@/shared/ui/stamp";
import { Tag } from "@/shared/ui/tag";

export const metadata: Metadata = {
	// The layout's "%s · KODE" template only reaches child segments, so this page names KODE itself.
	title: { absolute: "KODE · QR kode sortzailea, euskaraz eta doan" },
	description:
		"Sortu QR kodeak doan eta konturik gabe: itsatsi esteka, aukeratu markoa, formak eta koloreak, " +
		"eta deskargatu PNG, SVG edo WebP. Dena zure nabigatzailean.",
};

const COLUMN = "mx-auto w-full max-w-[1200px] px-space-4 sm:px-space-6";

const SAMPLE_LINK = "https://kode.eus/";

/** The hero's sample code, drawn once at build time: the sticker is its frame. */
const sample = designQrCode(
	{ link: SAMPLE_LINK, design: { ...DEFAULT_DESIGN, frame: "none" } },
	{ encoder: new QrcodeGeneratorEncoder() },
);
const SAMPLE_SRC = `data:image/svg+xml,${encodeURIComponent(sample.status === "ready" ? sample.svg : "")}`;

function Hero() {
	return (
		<section
			className={`${COLUMN} flex flex-wrap items-center gap-space-9 pt-[40px] pb-[56px]`}
		>
			<div className="flex min-w-0 flex-[999_1_520px] flex-col gap-space-6">
				<Tag className="self-start">Doan · konturik gabe · euskaraz</Tag>
				<h1 className="m-0 font-display text-[length:clamp(40px,5.6vw,var(--text-display-xl))] leading-(--text-display-xl--line-height) font-extrabold tracking-(--text-display-xl--letter-spacing)">
					QR kodeak.
					<br />
					Euskaraz.
					<br />
					<span className="text-violet underline decoration-wave decoration-wavy decoration-[5px] underline-offset-[12px]">
						Doan.
					</span>
				</h1>
				<p className="m-0 max-w-[540px] text-lead text-ink-muted">
					Itsatsi esteka, jolastu markoarekin, formekin eta koloreekin, eta deskargatu.
					Konturik gabe, eta dena zure nabigatzailean.
				</p>
				<div className="flex flex-wrap items-center gap-[18px]">
					<Button href="#sortzailea" size="lg">
						Hasi orain
					</Button>
					<span className="font-display text-caption tracking-[0.06em]">
						PNG · SVG · WEBP
					</span>
				</div>
			</div>
			<div className="flex min-w-0 flex-[1_1_340px] justify-center pt-[64px] pb-space-6">
				<div className="relative w-[300px] max-w-full">
					<QrSticker label="Eskaneatu" tilt>
						{/* oxlint-disable-next-line nextjs/no-img-element -- an inline SVG data URI: there is nothing for next/image to optimise */}
						<img
							src={SAMPLE_SRC}
							alt={`QR kodearen adibidea: ${SAMPLE_LINK}`}
							className="block h-auto w-full"
						/>
					</QrSticker>
					{/* On the sticker's corner, clear of the finder pattern, so the sample still scans. */}
					<div className="absolute -top-[52px] -left-[24px]">
						<Stamp>Doan!</Stamp>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Home() {
	return (
		<>
			<header className={`${COLUMN} py-[22px]`}>
				<Logo href="/" />
			</header>
			<main>
				<Hero />
				<section id="sortzailea" className={`${COLUMN} scroll-mt-space-6 pb-space-10`}>
					<QrGenerator />
				</section>
			</main>
			<footer className={COLUMN}>
				<div className="flex flex-wrap justify-between gap-space-3 border-t-soft border-line py-space-6 text-small text-ink-muted">
					<p className="m-0">
						QR Code DENSO WAVE Incorporated-en marka erregistratua da.
					</p>
					<p className="m-0 font-bold text-ink">kode.eus</p>
				</div>
			</footer>
		</>
	);
}
