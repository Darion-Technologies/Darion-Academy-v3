async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase public credentials are not configured.");
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: anonKey },
  });
  if (!response.ok) throw new Error(`Could not read Supabase Auth settings: ${response.status}`);
  const settings = await response.json() as { disable_signup?: boolean };
  if (!settings.disable_signup) {
    throw new Error("Public Supabase signup is still enabled. Disable new user signups in the Supabase Auth settings before production.");
  }
  console.log("Supabase public signup is disabled.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
