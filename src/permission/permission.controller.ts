import {Body, Controller, Get, NotFoundException, Post, UseGuards} from "@nestjs/common";
import {hasPermissions} from "src/auth/decorators/permission.decorator";
import {JwtAuthGuard} from "src/auth/guards/jwt-auth.guard";
import {PermissionGuard} from "src/auth/guards/permission.guard";
import {PermissionService} from "./permission.service";


@Controller("permission")
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ){}

    private PERMSSIONS_NOT_FOUND = "There is no permissions were found";

    @hasPermissions("CREATE_PERMISSION")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createPermisson(                     
        @Body("title") title: string,
        @Body("description") description: string,
        @Body("active") active: boolean
    ){
        const permission = await this.permissionService.savePermission({
            title,
            description,
            active
        })
        return permission;
    }

    @hasPermissions("VIEW_PERMISSION")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Get()
    async getAllPermission(){
        const permissions = await this.permissionService.findAll();
        if(!permissions){
            return new NotFoundException(this.PERMSSIONS_NOT_FOUND) 
        }
        return permissions
    }
}
