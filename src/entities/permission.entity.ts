import {Length} from "class-validator";
import {Column, Entity, ManyToMany} from "typeorm";
import Base from "./base.entity";
import {Role} from "./role.entity";


@Entity("permissions")
export class Permission extends Base {
    
    @Column({unique: true})
    @Length(1, 255)
    title: string

    @Column()
    active: boolean

    @Column()
    @Length(0, 255)
    description: string

    @ManyToMany(type => Role, role => role.permissions)
    roles: Role[];

}
