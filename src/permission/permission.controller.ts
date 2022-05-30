import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { hasPermissions } from 'src/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Exception } from 'src/constants/error';
import { finalResponse } from 'src/utilize/base-response';
import { PermissionService } from './permission.service';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @hasPermissions('CREATE_PERMISSION')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createPermisson(
    @Res() res: Response,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('active') active: boolean,
  ) {
    try {
      const permission = await this.permissionService.savePermission({
        title,
        description,
        active,
      });
      finalResponse(res, HttpStatus.OK, { data: permission });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('VIEW_PERMISSION')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  async getAllPermission(@Res() res: Response) {
    try {
      const permissions = await this.permissionService.findAll();
      if (!permissions) {
        return new NotFoundException(Exception.PERMISSION_NOT_FOUND);
      }
      finalResponse(res, HttpStatus.OK, { data: permissions });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
