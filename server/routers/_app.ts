import { router } from '../trpc';
import { syncRouter } from './sync';

export const appRouter = router({
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
