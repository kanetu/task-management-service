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
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { hasPermissions } from 'src/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Exception } from 'src/constants/error';
import { ProjectService } from 'src/project/project.service';
import { TaskCommentService } from 'src/task-comment/task-comment.service';
import { finalResponse } from 'src/utilize/base-response';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly taskCommentService: TaskCommentService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @hasPermissions('VIEW_TASK')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':taskId')
  async getTask(@Res() res: Response, @Param('taskId') taskId: string) {
    try {
      const task = await this.taskService.getTaskWithComment(taskId);
      if (!task) {
        return new NotFoundException(Exception.TASK_NOT_FOUND);
      }
      finalResponse(res, HttpStatus.OK, { data: task });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('CREATE_TASK')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post(':projectId')
  async createTask(
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('remaining') remaining: string,
    @Body('estimate') estimate: string,
    @Body('complete') complete: string,
    @Body('priority') priority: string,
    @Body('assignTo') assignTo: string,
  ) {
    try {
      const project = await this.projectService.findProject({ id: projectId });
      if (!project) {
        return new NotFoundException(Exception.PROJECT_NOT_FOUND);
      }
      let user;
      if (assignTo) {
        user = await this.authService.findOne({ id: assignTo });
        if (!user) {
          return new NotFoundException(Exception.USER_NOT_FOUND);
        }
      }
      const task = await this.taskService.saveTask({
        title,
        description,
        remaining,
        estimate,
        complete,
        status: 'NEW',
        priority,
        project: projectId,
        assignTo: user ? user : null,
      });

      finalResponse(res, HttpStatus.OK, { data: task });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_TASK')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put(':taskId')
  async updateTask(
    @Res() res: Response,
    @Param('taskId') taskId: string,
    @Body('title') title: string,
    @Body('assignTo') assignTo: string,
    @Body('description') description: string,
    @Body('status') status: string,
    @Body('priority') priority: string,
    @Body('remaining') remaining: number,
    @Body('estimate') estimate: number,
    @Body('complete') complete: number,
  ) {
    try {
      const task = await this.taskService.getTask({ id: taskId });
      if (!task) {
        return new NotFoundException(Exception.TASK_NOT_FOUND);
      }
      task.title = title ? title : task.title;
      task.description = description ? description : task.description;
      task.status = status ? status : task.status;
      task.priority = priority ? priority : task.priority;
      task.remaining = remaining ? remaining : task.remaining;
      task.estimate = estimate ? estimate : task.estimate;
      task.complete = complete ? complete : task.complete;

      if (assignTo) {
        const user = await this.authService.findOne({ id: assignTo });
        if (!user) {
          return new NotFoundException(Exception.USER_NOT_FOUND);
        }

        task.assignTo = user;
      }

      const afterSaveTask = await this.taskService.saveTask(task);

      finalResponse(res, HttpStatus.OK, { data: afterSaveTask });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post(':taskId/comment')
  async createComment(
    @Res() res: Response,
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body('content') content: string,
  ) {
    try {
      const cookie = req.cookies['auth'];

      const user = await this.jwtService.verifyAsync(cookie);
      if (!user) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const task = await this.taskService.getTask({ id: taskId });

      if (!task) {
        return new NotFoundException(Exception.TASK_NOT_FOUND);
      }

      const afterCreateComment = await this.taskCommentService.saveComment({
        content: content,
        task: taskId,
        user: user.id,
      });

      finalResponse(res, HttpStatus.OK, { data: afterCreateComment });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put(':taskId/comment/:commentId')
  async editComment(
    @Res() res: Response,
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    try {
      const cookie = req.cookies['auth'];

      const user = await this.jwtService.verifyAsync(cookie);
      if (!user) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const task = await this.taskService.getTask({ id: taskId });
      if (!task) {
        return new NotFoundException(Exception.TASK_NOT_FOUND);
      }

      const comment = await this.taskCommentService.getComment({
        id: commentId,
        user: user.id,
      });
      if (!comment) {
        return new NotFoundException(Exception.COMMENT_NOT_FOUND);
      }

      comment.content = content ? content : comment.content;
      comment.updateAt = new Date();

      const afterSaveComment = await this.taskCommentService.saveComment(
        comment,
      );

      finalResponse(res, HttpStatus.OK, { data: afterSaveComment });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete(':taskId/comment/:commentId')
  async removeComment(
    @Res() res: Response,
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      const cookie = req.cookies['auth'];

      const user = await this.jwtService.verifyAsync(cookie);
      if (!user) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const task = await this.taskService.getTask({ id: taskId });
      if (!task) {
        return new NotFoundException(Exception.TASK_NOT_FOUND);
      }

      const comment = await this.taskCommentService.getComment({
        id: commentId,
        user: user.id,
      });
      if (!comment) {
        return new NotFoundException(Exception.COMMENT_NOT_FOUND);
      }

      const afterRemoveComment = await this.taskCommentService.removeComment(
        comment,
      );

      finalResponse(res, HttpStatus.OK, { data: afterRemoveComment });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
