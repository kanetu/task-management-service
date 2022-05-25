import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { hasPermissions } from 'src/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Exception } from 'src/constants/error';
import { PermissionService } from 'src/permission/permission.service';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  @hasPermissions('VIEW_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  async getRole() {
    const result = await this.roleService.getAllRole();

    return result;
  }

  @hasPermissions('CREATE_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createRole(@Body('name') name: string) {
    const result = await this.roleService.saveRole({
      name,
    });

    return result;
  }

  @hasPermissions('EDIT_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put()
  async updateRole(
    @Body('roleId') roleId: string,
    @Body('permissionId') permissionId: string,
  ) {
    try {
      const permission = await this.permissionService.findPermission({
        id: permissionId,
      });
      if (!permission) {
        return new NotFoundException(Exception.PERMISSION_NOT_FOUND);
      }

      const roleWithPermissions = await this.roleService.getRole({
        relations: ['permissions'],
        where: {
          id: roleId,
        },
      });

      if (!roleWithPermissions) {
        return new NotFoundException(Exception.ROLE_NOT_FOUND);
      }

      if (
        !roleWithPermissions.permissions.some(
          (p) => p.title === permission.title,
        )
      ) {
        roleWithPermissions.permissions.push(permission);
      } else {
        roleWithPermissions.permissions =
          roleWithPermissions.permissions.filter(
            (p) => p.title !== permission.title,
          );
      }

      await this.roleService.saveRole(roleWithPermissions);

      return roleWithPermissions;
    } catch (err) {
      console.log(err);
    }
  }

  @hasPermissions('DELETE_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete(':roleId')
  async deleteRole(@Param('roleId') roleId: string) {
    try {
      const role = await this.roleService.getRole({ id: roleId });
      if (!role) {
        return new NotFoundException(Exception.ROLE_NOT_FOUND);
      }

      console.log(role);
      const isRemove = await this.roleService.removeRole(role);
      return { isSuccess: !!isRemove };
    } catch (err) {
      console.log(err);
    }
  }
}
