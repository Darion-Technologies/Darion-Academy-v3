"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Upload, Trash2, Eye } from "lucide-react";
import { uploadAvatarAction, removeAvatarAction } from "@/app/actions/account";
import { toast } from "sonner";
import { initials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AvatarUpload({
  name,
  currentAvatarUrl,
}: {
  name: string;
  currentAvatarUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [viewOpen, setViewOpen] = useState(false);
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

  function handleRemove() {
    setPreview(null);
    startTransition(async () => {
      try {
        const result = await removeAvatarAction();
        if (result?.success) {
          toast.success("Profile picture removed");
        } else {
          toast.error("Failed to remove profile picture");
          setPreview(currentAvatarUrl);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to remove profile picture");
        setPreview(currentAvatarUrl);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isPending}
            className="relative group size-24 shrink-0 border-4 border-background bg-muted shadow-lg transition-transform hover:scale-105 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Update profile picture"
          >
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
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            {/* Upload Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
              {isPending ? (
                <Loader2 className="size-6 animate-spin text-white" />
              ) : (
                <Camera className="size-6 text-white" />
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {preview && (
            <DropdownMenuItem onClick={() => setViewOpen(true)} disabled={isPending}>
              <Eye className="mr-2 size-4" />
              View Photo
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => inputRef.current?.click()} disabled={isPending}>
            <Upload className="mr-2 size-4" />
            Upload Photo
          </DropdownMenuItem>
          {preview && (
            <DropdownMenuItem 
              onClick={handleRemove} 
              disabled={isPending}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 size-4" />
              Remove Photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={preview} 
                alt="Profile Photo" 
                className="max-h-[60vh] max-w-full rounded-md object-contain" 
              />
            ) : (
              <div className="flex size-64 items-center justify-center rounded-full bg-primary/10 text-6xl font-bold text-primary">
                {initials(name)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isPending}
      />
    </>
  );
}
