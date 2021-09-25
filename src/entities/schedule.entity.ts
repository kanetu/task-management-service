import {Length} from "class-validator";
import {Column, CreateDateColumn, Entity, ManyToOne} from "typeorm";
import Base from "./base.entity";
import {User} from "./user.entity";



@Entity("schedules")
export class Schedule extends Base {

    @Column()
    @Length(1, 255)
    title: string;

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

    @ManyToOne(type => User, user => user.schedules)
    user: User;
}
