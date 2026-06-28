import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, boolean } from '@nozbe/watermelondb/decorators';

export default class Progress extends Model {
  static table = 'progress';

  @field('lesson_id') lessonId!: string;
  @field('timestamp') timestamp!: number;
  @field('max_timestamp') maxTimestamp!: number;
  @boolean('completed') completed!: boolean;
  
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('lessons', 'lesson_id') lesson: any;
}
