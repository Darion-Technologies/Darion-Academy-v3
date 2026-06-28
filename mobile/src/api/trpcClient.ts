import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/routers/_app';
import { localIp } from './client';
import superjson from 'superjson';

// Use standard API client auth mechanisms if needed
export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `http://${localIp}:3001/api/trpc`,
      async headers() {
        return {
          // Add auth headers here
        };
      },
    }),
  ],
});
