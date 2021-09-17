import {Body, Controller, Post} from "@nestjs/common";
import {PermissionService} from "./permission.service";


@Controller("permission")
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ){}

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
}
