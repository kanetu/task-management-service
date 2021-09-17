import {Body, Controller, Get, NotFoundException, Post, Put, Req, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "src/guards/jwt-auth.guard";
import {PermissionService} from "src/permission/permission.service";
import {RoleService} from "./role.service";


@Controller("role")
export class RoleController {

    constructor(
        private readonly roleService: RoleService,
        private readonly permissionService: PermissionService
    ){}
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async getRole(){
        const result = await this.roleService.getAllRole();

        return result;
    }

    @Post()
    async createRole(
        @Body("name") name: string,
    ){

        const result = await this.roleService.saveRole({
            name,
        })

        return result
    }

    @Put()
    async updateRole(
        @Body("roleId") roleId: string,
        @Body("permissionId") permissionId: string
    ){

        try{
            const permission = await this.permissionService.findPermission({id: permissionId})
            if(!permission) {
                throw new NotFoundException("Permission was not found")
            } 
            
            const roleWithPermissions = await this.roleService.getRole(
                {
                    relations: ["permissions"],
                    where: {
                        id: roleId
                    }
                }
            )

            if (!roleWithPermissions){
                throw new NotFoundException("Role was not found")
            }

            if (!roleWithPermissions.permissions.some(p => p.title === permission.title)){
                roleWithPermissions.permissions.push(permission)
            } else {
                roleWithPermissions.permissions = roleWithPermissions.permissions.filter(p => p.title !== permission.title)
            }

            await this.roleService.saveRole(roleWithPermissions)
           
            return roleWithPermissions;

            
        }catch(err) {
            console.log(err);
        }
        
    }

                                                
}
