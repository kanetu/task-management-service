import { Length, Min } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import Base from './base.entity';
import { Project } from './project.entity';

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

  @ManyToOne((type) => Project, (project) => project.tasks)
  project: Project;
}
