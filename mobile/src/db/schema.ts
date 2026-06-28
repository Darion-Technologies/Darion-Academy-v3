import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'courses',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'thumbnail_url', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'lessons',
      columns: [
        { name: 'course_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'content', type: 'string', isOptional: true },
        { name: 'video_url', type: 'string', isOptional: true },
        { name: 'order', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'progress',
      columns: [
        { name: 'lesson_id', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'max_timestamp', type: 'number' },
        { name: 'completed', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'lesson_id', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'text', type: 'string' },
        { name: 'is_doubt', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
