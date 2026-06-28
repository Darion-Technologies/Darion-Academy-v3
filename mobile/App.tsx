import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/context/QueryProvider';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './src/db';
import { sync } from './src/db/sync';

import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  React.useEffect(() => {
    // Initial sync
    sync().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <DatabaseProvider database={database}>
        <QueryProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </QueryProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
