import { Length, Min } from 'class-validator';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import Base from './base.entity';
import { TaskComment } from './task-comment.entity';
import { Project } from './project.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';

export enum TaskStatus {
  NEW = 'New',
  IN_PROCESSING = 'In processing',
  RESOLVE = 'Resolve',
  READY_FOR_TEST = 'Ready for test',
  CLOSE = 'Close',
}

@Entity('tasks')
export class Task extends Base {
  @Column()
  @Length(1, 255)
  title: string;

  @Column()
  @Length(1, 255)
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NEW,
  })
  status: string;

  @Column()
  @Min(0)
  remaining: number;

  @Column()
  @Min(0)
  estimate: number;

  @Column()
  @Min(0)
  complete: number;

  @OneToMany((type) => TaskComment, (taskComment) => taskComment.task)
  comments: TaskComment[];

  @ManyToOne((type) => Project, (project) => project.tasks)
  project: Project;

  @ManyToOne((type) => User, (user) => user.tasks)
  assignTo: User;

  @ManyToMany((type) => Tag, (tag) => tag.tasks)
  tags: Tag[];
}
