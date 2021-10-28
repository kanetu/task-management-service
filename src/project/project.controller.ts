import {
  Body,
  Controller,
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
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @hasPermissions('VIEW_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  async getAllProject() {
    try {
      return await this.projectService.findAll();
    } catch (err) {
      console.log(err);
    }
  }

  @hasPermissions('VIEW_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':projectId')
  async getProjectWithTasks(@Param('projectId') projectId: string) {
    try {
      const project = await this.projectService.findProject({
        relations: ['tasks'],
        where: {
          id: projectId,
        },
      });
      if (!project) {
        return new NotFoundException(Exception.PROJECT_NOT_FOUND);
      }

      return project;
    } catch (err) {
      console.log(err);
    }
  }

  @hasPermissions('CREATE_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createProject(
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    try {
      const project = await this.projectService.saveProject({
        name: name,
        description: description,
      });
      return project;
    } catch (err) {
      console.log(err);
    }
  }

  @hasPermissions('EDIT_PROJECT')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put(':projectId')
  async updateProject(
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
      return afterSaveProject;
    } catch (err) {
      console.log(err);
    }
  }
}
