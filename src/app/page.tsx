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

const SOURCE_URL = "https://github.com/artberri/kode";
const AUTHOR_URL = "https://albertovarela.net/";
/** Footer links: bold ink without an underline, violet on hover. */
const FOOTER_LINK = "font-bold text-ink no-underline hover:text-violet";

/** The hero's sample code, drawn once at build time: the sticker is its frame. */
const sample = designQrCode(
	{
		content: { type: "esteka", link: SAMPLE_LINK },
		design: { ...DEFAULT_DESIGN, frame: "none" },
	},
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

/** Each reason's highlighter stroke, as whole class names so Tailwind finds them. */
const REASONS = [
	{
		title: "Lehenengo euskaraz",
		text: "Hasieratik euskaraz pentsatua, ez itzulia.",
		marker: "bg-[linear-gradient(transparent_55%,var(--color-mint)_55%)]",
	},
	{
		title: "Muxutruk betirako",
		text: "Beti egongo da doako bertsio bat, ordainpeko aukerak etortzen badira ere.",
		marker: "bg-[linear-gradient(transparent_55%,var(--color-butter)_55%)]",
	},
	{
		title: "Pribatutasuna lehenestea",
		text: "Inoiz ez ditugu zure datuak salduko, eta inoiz ez dizkizugu behar baino gehiago eskatuko.",
		marker: "bg-[linear-gradient(transparent_55%,var(--color-lilac)_55%)]",
	},
	{
		title: "Iragarkirik gabe",
		text: "Zu ez zara inoiz produktua izango, erabiltzailea baizik.",
		marker: "bg-[linear-gradient(transparent_55%,var(--color-peach)_55%)]",
	},
] as const;

/** The manifesto's heading, labelling the section by `id`. */
function ReasonsIntro({ id }: { readonly id: string }) {
	return (
		<div className="flex min-w-0 flex-[1_1_340px] flex-col gap-space-4">
			<p className="m-0 font-display text-eyebrow text-violet uppercase">Manifestua</p>
			<h2
				id={id}
				className="m-0 pb-space-3 font-display text-[length:clamp(32px,4vw,var(--text-display-lg))] leading-(--text-display-lg--line-height) font-extrabold tracking-(--text-display-lg--letter-spacing)"
			>
				{/* ".eus" as in the wordmark: smaller and violet. */}
				KODE<span className="text-[0.62em] text-violet">.eus</span> aukeratzeko{" "}
				<span className="whitespace-nowrap text-violet underline decoration-wave decoration-wavy decoration-[4px] underline-offset-[10px]">
					lau arrazoi.
				</span>
			</h2>
			<p className="m-0 max-w-[340px] text-ink-muted">
				KODE hazten denean ere, hauek ez dira aldatuko.
			</p>
		</div>
	);
}

/** The manifesto under the generator: the promises KODE keeps as it grows. */
function Reasons() {
	return (
		<section
			aria-labelledby="arrazoiak"
			className={`${COLUMN} flex flex-wrap items-start gap-x-[72px] gap-y-space-7 pb-space-10`}
		>
			<ReasonsIntro id="arrazoiak" />
			<ol
				// oxlint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list role from a list-style: none list unless it is explicit
				role="list"
				className="m-0 min-w-0 flex-[999_1_520px] list-none border-b-firm border-ink p-0"
			>
				{REASONS.map(({ title, text, marker }, index) => (
					<li
						key={title}
						className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-space-5 gap-y-space-2 border-t-firm border-ink py-space-7 sm:grid-cols-[72px_minmax(0,1fr)]"
					>
						{/* The list already numbers its items for screen readers. */}
						<span
							aria-hidden="true"
							className="font-display text-title font-extrabold text-violet"
						>
							{`0${String(index + 1)}`}
						</span>
						<div className="flex flex-col gap-space-3">
							<h3 className="m-0 font-display text-title">
								<span
									className={`-mx-space-1 box-decoration-clone px-space-1 ${marker}`}
								>
									{title}
								</span>
							</h3>
							<p className="m-0 max-w-[560px] text-ink-muted">{text}</p>
						</div>
					</li>
				))}
			</ol>
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
				<Reasons />
			</main>
			<footer className={COLUMN}>
				<div className="flex flex-wrap justify-between gap-space-3 border-t-soft border-line py-space-6 text-small text-ink-muted">
					<p className="m-0">
						<a href={SOURCE_URL} className={FOOTER_LINK}>
							Software librea
						</a>{" "}
						maitatu, faxismoa gorrotatu
					</p>
					<p className="m-0">
						{/* The ergative -k stays outside the link, which names the person. */}
						<a href={AUTHOR_URL} className={FOOTER_LINK}>
							Alberto Varela
						</a>
						k desorduetan egina
					</p>
				</div>
			</footer>
		</>
	);
}
