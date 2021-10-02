import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "src/auth/auth.module";
import {Schedule} from "src/entities/schedule.entity";
import {PermissionModule} from "src/permission/permission.module";
import {ScheduleController} from "./schedule.controller";
import {ScheduleService} from "./schedule.service";



@Module({
    imports: [
        forwardRef(()=> AuthModule),
        TypeOrmModule.forFeature([Schedule]),
        PermissionModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: "1d"}
        })
    ],
    controllers: [ScheduleController],
    providers: [ScheduleService],
    exports: [ScheduleService]
})
export class ScheduleModule {}

