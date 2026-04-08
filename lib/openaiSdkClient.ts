import OpenAI, { type ClientOptions } from "openai";

function trimEnv(value: string | undefined): string | null {
	const t = value?.trim();
	return t ? t : null;
}

/**
 * Resolves OpenAI-Project for the official JS SDK.
 *
 * If we pass `project: undefined`, the SDK falls back to `OPENAI_PROJECT_ID` from the environment.
 * Hosting dashboards (e.g. Vercel + OpenAI integration) often inject `OPENAI_PROJECT_ID` for another
 * project than the `OPENAI_API_KEY` you set manually → 401 “OpenAI-Project header should match…”.
 *
 * We therefore only send a project header when you explicitly configure it via `OPENAI_PROJECT`.
 */
export function resolveOpenAIProjectForSdk(): string | null {
	return trimEnv(process.env.OPENAI_PROJECT);
}

export function resolveOpenAIOrganizationForSdk(): string | null {
	return trimEnv(process.env.OPENAI_ORG_ID);
}

export function createOpenAIClient(
	apiKey: string,
	extra?: Omit<ClientOptions, "apiKey">,
): OpenAI {
	return new OpenAI({
		apiKey,
		organization: resolveOpenAIOrganizationForSdk(),
		project: resolveOpenAIProjectForSdk(),
		...extra,
	});
}
