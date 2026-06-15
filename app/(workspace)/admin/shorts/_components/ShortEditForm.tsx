"use client";

import { useState } from "react";
import { updateShortDetailsAction } from "@/actions/shorts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function ShortEditForm({
  shortId,
  initialDescription,
  initialTranscript,
}: {
  shortId: string;
  initialDescription?: string;
  initialTranscript?: string;
}) {
  const [description, setDescription] = useState(initialDescription || "");
  const [transcript, setTranscript] = useState(initialTranscript || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateShortDetailsAction(shortId, { description, transcript });
      toast.success("Short details updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update short details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Details</CardTitle>
        <CardDescription>
          Update the description and markdown transcript (captions/code blocks) for this short.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter the short's description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript (Markdown supported)</Label>
          <Textarea
            id="transcript"
            placeholder="Enter transcript here. You can use markdown like ```javascript\nconsole.log('hello');\n``` to format code snippets."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[250px] font-mono text-sm"
          />
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
