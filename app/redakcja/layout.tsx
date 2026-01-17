import type { ReactNode } from "react";
import InfoOfDayBanner from "@/components/News/InfoOfDayBanner";

export default function RedakcjaLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<InfoOfDayBanner />
			{children}
		</>
	);
}


