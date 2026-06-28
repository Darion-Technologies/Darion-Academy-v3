import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation, boolean } from '@nozbe/watermelondb/decorators';

export default class Note extends Model {
  static table = 'notes';

  @field('lesson_id') lessonId!: string;
  @field('timestamp') timestamp!: number;
  @text('text') text!: string;
  @boolean('is_doubt') isDoubt!: boolean;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('lessons', 'lesson_id') lesson: any;
}
