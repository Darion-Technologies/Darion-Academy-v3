"use client";

import { useActionState } from "react";
import { submitAssignmentAction } from "@/app/actions/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SubmissionForm({ assignmentId, allowText, allowFile, allowLink }: { assignmentId: string; allowText: boolean; allowFile: boolean; allowLink: boolean }) {
  const [state, action, pending] = useActionState(submitAssignmentAction, {});
  return <form action={action} className="space-y-4"><input type="hidden" name="assignmentId" value={assignmentId} />
    {allowText && <div><Label>Your answer</Label><Textarea name="textAnswer" /></div>}
    {allowLink && <div><Label>External link</Label><Input name="externalUrl" type="url" placeholder="https://" /></div>}
    {allowFile && <div><Label>Attachment</Label><Input name="file" type="file" /></div>}
    {state.error && <p className="text-sm text-red-600">{state.error}</p>}{state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
    <Button disabled={pending}>{pending ? "Submitting..." : "Submit for review"}</Button>
  </form>;
}
