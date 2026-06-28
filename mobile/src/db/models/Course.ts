import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, children } from '@nozbe/watermelondb/decorators';

export default class Course extends Model {
  static table = 'courses';

  @text('title') title!: string;
  @text('description') description!: string;
  @text('thumbnail_url') thumbnailUrl?: string;
  @text('status') status!: string;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('lessons') lessons: any;
}
