import type { HTMLAttributes } from "react";

type SlowDataNoticeProps = HTMLAttributes<HTMLDivElement>;

export default function SlowDataNotice(props: SlowDataNoticeProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={
				"rounded-xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-200 px-4 py-3 " +
				(props.className ?? "")
			}
			{...props}
		>
			<div className="flex items-start gap-3">
				<span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center">
					<span className="h-3 w-3 rounded-full border-2 border-yellow-300/70 border-b-transparent animate-spin" aria-hidden />
				</span>
				<div className="text-sm">
					<strong className="font-semibold">Chwila cierpliwości.</strong>{" "}
					<span>
						Nasze AI skanuje internet w poszukiwaniu najlepszych cen i informacji. Ładowanie może potrwać dłużej.
					</span>
				</div>
			</div>
		</div>
	);
}


