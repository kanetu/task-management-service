import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "src/auth/auth.module";
import {Project} from "src/entities/project.entity";
import {ProjectController} from "./project.controller";
import {ProjectService} from "./project.service";



@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([Project]),
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
    exports: [ProjectService]
})
export class ProjectModule{}
