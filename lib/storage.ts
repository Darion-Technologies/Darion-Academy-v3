import { createAdminClient } from "@/lib/supabase/admin";

const bucketRules: Record<string, { maxBytes: number; mime: RegExp }> = {
  "course-files": { maxBytes: 10 * 1024 * 1024, mime: /^image\/(png|jpeg|webp)$/ },
  "lesson-files": { maxBytes: 10 * 1024 * 1024, mime: /^(image\/|video\/|application\/pdf$|application\/vnd\.|application\/msword$)/ },
  submissions: { maxBytes: 10 * 1024 * 1024, mime: /^(image\/|application\/pdf$|application\/vnd\.|application\/msword$|text\/plain$)/ },
  certificates: { maxBytes: 10 * 1024 * 1024, mime: /^(application\/pdf$|image\/(png|jpeg|webp)$)/ },
  "profile-images": { maxBytes: 5 * 1024 * 1024, mime: /^image\/(png|jpeg|webp)$/ },
};

export function getPrivateUploadMaxBytes(bucket: string) {
  const rule = bucketRules[bucket];
  if (!rule) throw new Error("Unsupported storage bucket.");
  return rule.maxBytes;
}

export async function uploadPrivateFile(bucket: string, path: string, file: File) {
  const rule = bucketRules[bucket];
  if (!rule) throw new Error("Unsupported storage bucket.");
  if (file.size > rule.maxBytes) throw new Error("The selected file exceeds the allowed size.");
  if (!rule.mime.test(file.type)) throw new Error("This file type is not allowed.");
  if (path.includes("..") || path.startsWith("/")) throw new Error("Invalid storage path.");
  const supabase = createAdminClient();
  const safePath = path.split("/").map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "_")).join("/");
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(safePath, arrayBuffer, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  return safePath;
}

export async function createSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  if (!bucketRules[bucket] || path.includes("..") || path.startsWith("/")) throw new Error("Invalid storage request.");
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
