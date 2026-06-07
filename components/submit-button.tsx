"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Saving...",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
}
