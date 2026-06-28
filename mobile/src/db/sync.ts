import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { trpc } from '../api/trpcClient';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await trpc.sync.pullChanges.query({
        lastPulledAt,
        schemaVersion,
        migration,
      });

      return {
        changes: response.changes,
        timestamp: response.timestamp,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await trpc.sync.pushChanges.mutate({
        changes,
        lastPulledAt,
      });
    },
    migrationsEnabledAtVersion: 1,
  });
}
