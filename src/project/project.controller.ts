import {
  Body,
  Controller,
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
import { AuthService } from 'src/auth/auth.service';
import { hasPermissions } from 'src/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { DEFAULT_PAGING } from 'src/constants/common';
import { Exception } from 'src/constants/error';
import { IPaging } from 'src/models/common/IPaging';
import { finalResponse } from 'src/utilize/base-response';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
  ) {}

  @hasPermissions('VIEW_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('/filter')
  async filterProject(
    @Res() res: Response,
    @Body('paging') paging: IPaging,
    @Body('keyword') keyword: string,
  ) {
    try {
      const query = {
        keyword: keyword || '',
        take: paging.pageSize || DEFAULT_PAGING.pageSize,
        skip:
          (paging.pageIndex || DEFAULT_PAGING.pageIndex) *
          (paging.pageSize || DEFAULT_PAGING.pageSize),
      };
      const { result, total } = await this.projectService.filterProjects(query);
      console.log(result);
      finalResponse(res, HttpStatus.OK, {
        data: result,
        paging: { ...paging, keyword: keyword, total },
      });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('VIEW_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':projectId')
  async getProjectWithTasks(
    @Res() res: Response,
    @Param('projectId') projectId: string,
  ) {
    try {
      const project = await this.projectService.findProject({
        relations: [
          'tasks',
          'tasks.assignTo',
          'tasks.comments',
          'tasks.comments.user',
          'users',
          'users.role',
        ],
        where: {
          id: projectId,
        },
      });
      if (!project) {
        return new NotFoundException(Exception.PROJECT_NOT_FOUND);
      }

      finalResponse(res, HttpStatus.OK, { data: project });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('CREATE_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createProject(
    @Res() res: Response,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    try {
      const project = await this.projectService.saveProject({
        name: name,
        description: description,
      });
      finalResponse(res, HttpStatus.OK, { data: project });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put(':projectId')
  async updateProject(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    try {
      const project = await this.projectService.findProject({ id: projectId });
      if (!project) {
        return new NotFoundException(Exception.PROJECT_NOT_FOUND);
      }
      project.name = name ? name : project.name;
      project.description = description ? description : project.description;

      const afterSaveProject = await this.projectService.saveProject(project);
      finalResponse(res, HttpStatus.OK, { data: afterSaveProject });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('addMember/:projectId')
  async addMember(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Body('userId') userId: string,
  ) {
    try {
      const user = await this.authService.findOne({ id: userId });
      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }
      const project = await this.projectService.findProject({
        relations: ['users'],
        where: {
          id: projectId,
        },
      });

      if (!project) {
        return new NotFoundException(Exception.PROJECT_NOT_FOUND);
      }

      if (!project.users.some((p) => p.id === user.id)) {
        project.users.push(user);
      } else {
        project.users = project.users.filter((p) => p.id !== user.id);
      }

      const afterSaveProject = await this.projectService.saveProject(project);
      finalResponse(res, HttpStatus.OK, { data: afterSaveProject });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
