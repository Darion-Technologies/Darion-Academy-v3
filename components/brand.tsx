import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`whitespace-nowrap text-[15px] font-bold tracking-tight ${inverse ? "text-white" : "text-foreground"}`}
    >
      <span>
        Darion <span className={inverse ? "text-[#8fd9ee]" : "text-primary"}>Academy</span>
      </span>
    </Link>
  );
}
