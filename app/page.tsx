import { requireUser, roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await requireUser();
  redirect(roleHome[user.role]);
}
