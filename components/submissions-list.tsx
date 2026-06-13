import { ReviewForm } from "@/components/review-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubmissionItem = {
  id: string; status: string; textAnswer: string | null; externalUrl: string | null; fileUrl: string | null; submittedAt: Date | null;
  learner: { name: string; email: string };
  assignment: { lesson: { title: string; module: { course: { title: string } } } };
};
export function SubmissionsList({ submissions }: { submissions: SubmissionItem[] }) {
  if (!submissions.length) return <p className="border bg-card p-8 text-center text-sm text-muted-foreground">No submissions need review.</p>;
  return <div className="space-y-5">{submissions.map((submission) => <Card key={submission.id}><CardHeader><div className="flex items-start justify-between"><div><CardTitle>{submission.assignment.lesson.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{submission.learner.name} · {submission.assignment.lesson.module.course.title}</p></div><Badge>{submission.status}</Badge></div></CardHeader><CardContent className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="bg-muted/50 p-4 text-sm whitespace-pre-wrap">{submission.textAnswer || "No text answer."}{submission.externalUrl && <p className="mt-3"><a className="text-blue-700 underline" href={submission.externalUrl} target="_blank" rel="noreferrer">Open submitted link</a></p>}{submission.fileUrl && <p className="mt-3"><a className="text-blue-700 underline" href={`/api/submissions/${submission.id}`} target="_blank" rel="noreferrer">Download submitted file</a></p>}</div><ReviewForm submissionId={submission.id} /></CardContent></Card>)}</div>;
}
