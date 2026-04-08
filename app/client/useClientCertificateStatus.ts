"use client";

import { useEffect, useState } from "react";

export type ClientCertificateStatusState =
  | { status: "idle" | "loading" }
  | { status: "error" }
  | {
      status: "ready";
      certificateCompleted: boolean;
      recordId?: string;
      verifyAbsoluteUrl?: string;
      verifyPath?: string;
    };

export function useClientCertificateStatus(enabled: boolean): ClientCertificateStatusState {
  const [state, setState] = useState<ClientCertificateStatusState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;

    (async () => {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/client/certificate-status", {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;

        if (res.status === 401) {
          setState({ status: "ready", certificateCompleted: false });
          return;
        }

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const data = (await res.json()) as {
          ok?: boolean;
          certificateCompleted?: boolean;
          recordId?: string;
          verifyAbsoluteUrl?: string;
          verifyPath?: string;
        };

        setState({
          status: "ready",
          certificateCompleted: Boolean(data.certificateCompleted),
          recordId: typeof data.recordId === "string" ? data.recordId : undefined,
          verifyAbsoluteUrl:
            typeof data.verifyAbsoluteUrl === "string" ? data.verifyAbsoluteUrl : undefined,
          verifyPath: typeof data.verifyPath === "string" ? data.verifyPath : undefined,
        });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
