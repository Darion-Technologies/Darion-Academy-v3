import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Course from './models/Course';
import Lesson from './models/Lesson';
import Progress from './models/Progress';
import Note from './models/Note';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'darion_academy_db',
  jsi: true, // Use JSI for performance
  onSetUpError: error => {
    // Database failed to load -- offer the user to reload the app or log out
    console.error('Failed to setup WatermelonDB adapter', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [Course, Lesson, Progress, Note],
});
