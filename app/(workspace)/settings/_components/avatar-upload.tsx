"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatarAction } from "@/app/actions/account";
import { toast } from "sonner";
import { initials } from "@/lib/utils";

export function AvatarUpload({
  name,
  currentAvatarUrl,
}: {
  name: string;
  currentAvatarUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    // Show optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      try {
        const result = await uploadAvatarAction(formData);
        if (result?.error) {
          toast.error(result.error);
          setPreview(currentAvatarUrl);
        } else if (result?.success && result.avatarUrl) {
          setPreview(result.avatarUrl);
          toast.success("Profile picture updated");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to upload profile picture");
        setPreview(currentAvatarUrl); // Revert on failure
      }
    });
  }

  return (
    <div className="relative group size-24 shrink-0 border-4 border-background bg-muted shadow-lg transition-transform hover:scale-105">
      {/* Avatar Image or Initials */}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
        {initials(name)}
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={name}
          className="relative z-10 size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Upload Overlay */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
        aria-label="Upload profile picture"
      >
        {isPending ? (
          <Loader2 className="size-6 animate-spin text-white" />
        ) : (
          <Camera className="size-6 text-white" />
        )}
      </button>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isPending}
      />
    </div>
  );
}
