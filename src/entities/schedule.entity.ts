import { Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, ManyToMany } from 'typeorm';
import Base from './base.entity';
import { User } from './user.entity';

@Entity('schedules')
export class Schedule extends Base {
  @Column()
  @Length(1, 255)
  title: string;

  @Column()
  creator: number;

  @Column()
  @Length(1, 255)
  description: string;

  @Column()
  @Length(1, 255)
  place: string;

  @CreateDateColumn()
  timeStart: Date;

  @CreateDateColumn()
  timeEnd: Date;

  @ManyToMany((type) => User, (user) => user.schedules)
  users: User[];
}
