import Link from "next/link";
import Image from "next/image";

export function Brand({ inverse = false, collapsed = false }: { inverse?: boolean; collapsed?: boolean }) {
  const logoContent = (
    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
      <Image src="/logo-blue.svg" alt="Darion Academy" width={20} height={20} className="object-contain" />
    </div>
  );

  if (collapsed) {
    return (
      <Link href="/" className="flex items-center justify-center h-full w-full">
        {logoContent}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center gap-2 whitespace-nowrap text-[15px] font-bold tracking-tight ${inverse ? "text-white" : "text-foreground"}`}
    >
      {logoContent}
      <span>
        Darion <span className={inverse ? "text-[#8fd9ee]" : "text-primary"}>Academy</span>
      </span>
    </Link>
  );
}
