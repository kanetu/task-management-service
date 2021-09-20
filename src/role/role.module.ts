import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "src/auth/auth.module";
import {Role} from "src/entities/role.entity";
import {PermissionModule} from "src/permission/permission.module";
import {RoleController} from "./role.controller";
import {RoleService} from "./role.service";

@Module({
    imports: [

        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([Role]),
        PermissionModule
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule{}
