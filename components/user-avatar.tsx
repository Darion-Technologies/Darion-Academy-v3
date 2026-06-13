"use client";

import { initials } from "@/lib/utils";

export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  return (
    <>
      <span className="absolute inset-0 flex items-center justify-center">{initials(name)}</span>
      {avatarUrl && (
        <img 
          src={avatarUrl} 
          alt="" 
          width={size}
          height={size}
          className="relative z-10 size-full object-cover" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
      )}
    </>
  );
}
