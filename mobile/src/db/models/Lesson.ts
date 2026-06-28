import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation, children } from '@nozbe/watermelondb/decorators';

export default class Lesson extends Model {
  static table = 'lessons';

  @text('course_id') courseId!: string;
  @text('title') title!: string;
  @text('type') type!: string;
  @text('content') content?: string;
  @text('video_url') videoUrl?: string;
  @field('order') order!: number;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('courses', 'course_id') course: any;
  @children('notes') notes: any;
  @children('progress') progress: any;
}
