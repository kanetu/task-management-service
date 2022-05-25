import { Length } from 'class-validator';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import Base from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('projects')
export class Project extends Base {
  @Column()
  @Length(1, 255)
  name: string;

  @Column()
  @Length(1, 255)
  description: string;

  @OneToMany((type) => Task, (task) => task.project, {
    cascade: true,
  })
  tasks: Task[];

  @ManyToMany((type) => User, (user) => user.projects, {
    cascade: true,
  })
  users: User[];
}
