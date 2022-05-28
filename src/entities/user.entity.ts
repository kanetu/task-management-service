import { IsEmail, Length } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Base from './base.entity';
import { Project } from './project.entity';
import { Role } from './role.entity';
import { Schedule } from './schedule.entity';
import { TaskComment } from './task-comment.entity';
import { Task } from './task.entity';

@Entity('users')
export class User extends Base {
  @Column()
  @Length(1, 180)
  name: string;

  @Column({ unique: true })
  @Length(1, 255)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Length(8, 255)
  password: string;

  @CreateDateColumn()
  birthday: Date;

  @Column()
  phoneNumber: string;

  @Column()
  isActive: boolean;

  @Column()
  avatarUrl: string;

  @OneToMany((type) => TaskComment, (taskComment) => taskComment.user)
  makeComments: TaskComment[];

  @ManyToOne((type) => Role, (role) => role.users)
  role: Role;

  @ManyToMany((type) => Schedule, (schedule) => schedule.users, {
    cascade: true,
  })
  @JoinTable()
  schedules: Schedule[];

  @OneToMany((type) => Task, (task) => task.assignTo)
  tasks: Task[];

  @ManyToMany((type) => Project, (project) => project.users)
  @JoinTable()
  projects: Project[];
}
