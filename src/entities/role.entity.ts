import { Length } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import Base from './base.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends Base {
  @Column()
  @Length(1, 255)
  name: string;

  @OneToMany((type) => User, (user) => user.role)
  users: User[];

  @ManyToMany((type) => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable()
  permissions: Permission[];

  addPermission(permission: Permission) {
    if (this.permissions === undefined) {
      this.permissions = new Array<Permission>();
    }
    this.permissions.push(permission);
  }
}
