import { initTRPC, TRPCError } from '@trpc/server';
import { prisma } from '../lib/prisma';
import superjson from 'superjson';
import { ZodError } from 'zod';

export const createContext = async (opts: any) => {
  // In a real app, extract user from req/res
  const req = opts?.req;
  const authHeader = req?.headers?.get('authorization');
  
  // Basic mock auth context. Using a valid UUID for Prisma @db.Uuid
  return {
    prisma,
    userId: '11111111-1111-1111-1111-111111111111', // TODO: Parse from JWT
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      prisma: ctx.prisma,
    },
  });
});
