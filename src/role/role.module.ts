import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Role} from "src/entities/role.entity";
import {PermissionModule} from "src/permission/permission.module";
import {RoleController} from "./role.controller";
import {RoleService} from "./role.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        PermissionModule
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule{}
