import { reviewSubmissionAction } from "@/app/actions/review";
import { SubmitButton } from "@/components/submit-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ submissionId }: { submissionId: string }) {
  return <form action={reviewSubmissionAction} className="space-y-3"><input type="hidden" name="submissionId" value={submissionId} /><Textarea name="feedback" placeholder="Feedback for the learner" /><Select name="status"><option value="APPROVED">Approve</option><option value="NEEDS_CORRECTION">Needs correction</option><option value="REJECTED">Reject</option></Select><SubmitButton size="sm" pendingText="Saving review...">Save review</SubmitButton></form>;
}
