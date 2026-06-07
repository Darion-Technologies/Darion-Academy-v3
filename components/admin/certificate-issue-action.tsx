"use client";

import { useActionState } from "react";
import {
  approveAndIssueCertificateAction,
  retryCertificateAction,
} from "@/app/actions/certificates";
import { SubmitButton } from "@/components/submit-button";

export function CertificateIssueAction({
  id,
  mode,
}: {
  id: string;
  mode: "approve" | "retry";
}) {
  const action = mode === "approve" ? approveAndIssueCertificateAction : retryCertificateAction;
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton size="sm" pendingText={mode === "approve" ? "Approving..." : "Retrying..."}>
        {mode === "approve" ? "Approve & issue" : "Retry"}
      </SubmitButton>
      {state.error && <p className="mt-1 max-w-52 text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="mt-1 max-w-52 text-xs text-emerald-600">{state.success}</p>}
    </form>
  );
}
