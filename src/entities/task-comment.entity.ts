import { Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import Base from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('taskComments')
export class TaskComment extends Base {
  @Column()
  @Length(1, 255)
  content: string;

  @ManyToOne((type) => Task, (task) => task.comments)
  task: Task;

  @ManyToOne((type) => User, (user) => user.makeComments)
  user: User;
}
