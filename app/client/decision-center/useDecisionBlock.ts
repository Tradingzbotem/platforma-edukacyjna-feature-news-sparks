"use client";

import { useEffect, useMemo, useState } from "react";
import type { DecisionBlockV1 } from "@/lib/decision-engine/types";
import type { RedakcjaNewsContextDto } from "@/lib/redakcja/redakcjaNewsContextTypes";
import type { DecisionHorizonApiParams } from "./decisionHorizon";

export type DecisionBlockFetchStatus = "idle" | "loading" | "success" | "error" | "empty";

export type DecisionBlockFetchState =
	| { status: "idle" | "loading" }
	| { status: "success"; block: DecisionBlockV1; redakcjaNewsContext: RedakcjaNewsContextDto | null }
	| { status: "error"; message: string }
	| { status: "empty"; message: string };

function appendQueryParams(base: URLSearchParams, q: DecisionHorizonApiParams) {
	base.set("decisionHorizon", q.decisionHorizon);
	if (q.timeframe) base.set("timeframe", q.timeframe);
	base.set("calendarDays", String(q.calendarDays));
	base.set("eventDays", String(q.eventDays));
	base.set("highRiskDays", String(q.highRiskDays));
}

/**
 * Pobiera Decision Block z `/api/decision-block` (aliasy: GOLD → XAUUSD po stronie API).
 * Parametry mapują okno makro, TF scenariusza ABC oraz `decisionHorizon` (tryb myślenia silnika).
 */
export function useDecisionBlock(
	assetParam: string | null,
	enabled: boolean,
	horizonParams: DecisionHorizonApiParams
): DecisionBlockFetchState {
	const [state, setState] = useState<DecisionBlockFetchState>({ status: "idle" });

	const horizonKey = useMemo(
		() =>
			`${horizonParams.decisionHorizon}|${horizonParams.timeframe ?? ""}|${horizonParams.calendarDays}|${horizonParams.eventDays}|${horizonParams.highRiskDays}`,
		[horizonParams]
	);

	useEffect(() => {
		if (!enabled || !assetParam) {
			setState({ status: "idle" });
			return;
		}

		let cancelled = false;
		const ac = new AbortController();
		setState({ status: "loading" });

		(async () => {
			try {
				const params = new URLSearchParams();
				params.set("asset", assetParam);
				appendQueryParams(params, horizonParams);
				const url = `/api/decision-block?${params.toString()}`;
				const res = await fetch(url, { cache: "no-store", signal: ac.signal });
				const json = (await res.json().catch(() => ({}))) as {
					ok?: boolean;
					error?: string;
					block?: DecisionBlockV1;
					redakcjaNewsContext?: RedakcjaNewsContextDto | null;
				};

				if (cancelled) return;

				if (!res.ok || json.ok === false) {
					setState({
						status: "error",
						message: typeof json.error === "string" ? json.error : `HTTP ${res.status}`,
					});
					return;
				}

				const block = json.block;
				if (!block || block.schemaVersion !== 1 || !block.asset) {
					setState({ status: "empty", message: "Brak poprawnego bloku decyzji w odpowiedzi API." });
					return;
				}

				const ctx = json.redakcjaNewsContext ?? null;
				setState({ status: "success", block, redakcjaNewsContext: ctx });
			} catch (e: unknown) {
				if (cancelled) return;
				if (e instanceof DOMException && e.name === "AbortError") return;
				const msg = e instanceof Error ? e.message : String(e);
				setState({ status: "error", message: msg || "Nie udało się pobrać Decision Block." });
			}
		})();

		return () => {
			cancelled = true;
			ac.abort();
		};
	}, [assetParam, enabled, horizonKey]);

	return state;
}
