import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-card p-6 text-center"><div><p className="text-sm font-bold text-blue-700">404</p><h1 className="mt-2 text-3xl font-bold">Page not found</h1><p className="mt-2 text-muted-foreground">This resource does not exist or you do not have access.</p><Button className="mt-6" asChild><Link href="/">Return home</Link></Button></div></main>;
}
