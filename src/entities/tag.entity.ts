import { Length } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import Base from './base.entity';
import { Task } from './task.entity';

@Entity('tags')
export class Tag extends Base {
  @Column()
  @Length(1, 255)
  name: string;

  @ManyToMany((type) => Task, (task) => task.tags)
  @JoinTable()
  tasks: Task[];
}
