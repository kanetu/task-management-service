import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
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
import { DATETIME_FORMAT } from 'src/constants/common';
import { Exception } from 'src/constants/error';
import { finalResponse } from 'src/utilize/base-response';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @Inject('MomentWrapper') private momentWrapper: any,
  ) {}

  @hasPermissions('VIEW_SCHEDULE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':selectedDate')
  async getSchedule(
    @Res() res: Response,
    @Req() req: Request,
    @Param('selectedDate') selectedDate: Date,
  ) {
    try {
      const cookie = req.cookies['auth'];

      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const dateFormatted =
        this.momentWrapper(selectedDate).format(DATETIME_FORMAT);

      const schedules = await this.scheduleService.getAllScheduleBaseOnUser(
        data['id'],
        dateFormatted,
      );

      if (!schedules) {
        return new NotFoundException(Exception.SCHEDULE_NOT_FOUND);
      }

      finalResponse(res, HttpStatus.OK, { data: schedules });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('CREATE_SCHEDULE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createSchedule(
    @Req() req: Request,
    @Res() res: Response,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('place') place: string,
    @Body('timeStart') timeStart: Date,
    @Body('timeEnd') timeEnd: Date,
  ) {
    try {
      const cookie = req.cookies['auth'];
      const data = this.jwtService.decode(cookie);
      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const user = await this.authService.findOne({
        relations: ['schedules'],
        where: {
          id: data['id'],
        },
      });

      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }

      const schedule = await this.scheduleService.saveSchedule({
        title,
        description,
        place,
        timeStart,
        timeEnd,
        creator: data['id'],
      });

      if (!user.schedules) {
        user.schedules = [schedule];
      } else {
        user.schedules.push(schedule);
      }

      const savedUser = await this.authService.save(user);

      finalResponse(res, HttpStatus.OK, { data: savedUser });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_SCHEDULE')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put(':scheduleId')
  async updateSchedule(
    @Res() res: Response,
    @Param('scheduleId') scheduleId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('place') place: string,
    @Body('timeStart') timeStart: Date,
    @Body('timeEnd') timeEnd: Date,
    @Body('addUserId') addUserId: string,
  ) {
    try {
      const schedule = await this.scheduleService.getSchedule({
        relations: ['users'],
        where: {
          id: scheduleId,
        },
      });

      if (!schedule) {
        return new NotFoundException(Exception.SCHEDULE_NOT_FOUND);
      }

      schedule.title = title ? title : schedule.title;
      schedule.description = description ? description : schedule.description;
      schedule.place = place ? place : schedule.place;
      schedule.timeStart = timeStart ? timeStart : schedule.timeStart;
      schedule.timeEnd = timeEnd ? timeEnd : schedule.timeEnd;

      if (addUserId) {
        const user = await this.authService.findOne({ id: addUserId });
        if (!user) {
          return new NotFoundException(Exception.USER_NOT_FOUND);
        }

        if (!schedule.users.some((u) => u.id === user.id)) {
          schedule.users.push(user);
        } else {
          schedule.users = schedule.users.filter((u) => u.id !== user.id);
        }
      }

      const afterSaveSchedule = await this.scheduleService.saveSchedule(
        schedule,
      );

      finalResponse(res, HttpStatus.OK, { data: afterSaveSchedule });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
