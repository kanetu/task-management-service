import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "src/auth/auth.module";
import {Task} from "src/entities/task.entity";
import {ProjectModule} from "src/project/project.module";
import {TaskController} from "./task.controller";
import {TaskService} from "./task.service";


@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([Task]),
        ProjectModule
    ],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}
