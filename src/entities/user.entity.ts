import { IsEmail, Length } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import Base from './base.entity';
import { Role } from './role.entity';
import { Schedule } from './schedule.entity';

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

  @ManyToOne((type) => Role, (role) => role.users)
  role: Role;

  @ManyToMany((type) => Schedule, (schedule) => schedule.users, {
    cascade: true,
  })
  @JoinTable()
  schedules: Schedule[];
}
