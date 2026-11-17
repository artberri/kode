import { QrGenerator } from "@/qr-code/infrastructure/ui/qr-generator";
import { Logo } from "@/shared/ui/logo";

const COLUMN = "mx-auto w-full max-w-[1200px] px-space-4 sm:px-space-6";

export default function Home() {
	return (
		<>
			<header className={`${COLUMN} py-[22px]`}>
				<Logo href="/" />
			</header>
			<main>
				<section id="sortzailea" className={`${COLUMN} pb-space-10`}>
					<QrGenerator />
				</section>
			</main>
		</>
	);
}
