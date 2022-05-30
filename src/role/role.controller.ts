import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { hasPermissions } from 'src/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Exception } from 'src/constants/error';
import { PermissionService } from 'src/permission/permission.service';
import { finalResponse } from 'src/utilize/base-response';
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
  async getRole(@Res() res: Response) {
    try {
      const result = await this.roleService.getAllRole();
      finalResponse(res, HttpStatus.OK, { data: result });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('CREATE_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createRole(@Res() res: Response, @Body('name') name: string) {
    try {
      const data = await this.roleService.saveRole({
        name,
      });

      finalResponse(res, HttpStatus.OK, { data });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put()
  async updateRole(
    @Res() res: Response,
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

      const data = await this.roleService.saveRole(roleWithPermissions);

      finalResponse(res, HttpStatus.OK, { data });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('DELETE_ROLE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete(':roleId')
  async deleteRole(@Res() res: Response, @Param('roleId') roleId: string) {
    try {
      const role = await this.roleService.getRole({ id: roleId });
      if (!role) {
        return new NotFoundException(Exception.ROLE_NOT_FOUND);
      }

      await this.roleService.removeRole(role);
      finalResponse(res, HttpStatus.OK);
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
