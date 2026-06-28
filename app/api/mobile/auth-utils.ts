import { createClient, User } from '@supabase/supabase-js';

// We use the regular supabase-js client because we only need it to validate the JWT passed from the mobile app.
// We don't need SSR cookie handling here since mobile doesn't use cookies for API auth.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache to prevent a 1-second penalty per API request from the same user.
const tokenCache = new Map<string, { user: User, expiresAt: number }>();

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  
  // Validate the JWT and get the user
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error("Mobile Auth Error:", error?.message);
    return null;
  }
  
  // Cache for 5 minutes
  tokenCache.set(token, { user, expiresAt: Date.now() + 5 * 60 * 1000 });
  
  // Optional: Cleanup old cache entries to prevent memory leaks if many tokens are used
  if (tokenCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of tokenCache.entries()) {
      if (value.expiresAt < now) tokenCache.delete(key);
    }
  }
  
  return user;
}
