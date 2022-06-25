import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RoleService } from 'src/role/role.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { hasPermissions } from './decorators/permission.decorator';
import { Exception } from 'src/constants/error';
import { finalResponse } from 'src/utilize/base-response';
import { IPaging } from 'src/models/common/IPaging';
import { DEFAULT_PAGING } from 'src/constants/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private roleService: RoleService,
  ) {}
  private saltOrRounds = 12;

  @Post('register')
  async register(
    @Res() res: Response,
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

      const user = await this.authService.save({
        name,
        email,
        password: hashedPassword,
      });

      const { password: _, ...result } = user;
      finalResponse(res, HttpStatus.OK, { data: result });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.authService.findUserWithPassword(email);

      if (!user) {
        return new BadRequestException(Exception.INVALID_CREDENTIAL);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return new BadRequestException(Exception.INVALID_CREDENTIAL);
      }

      const jwt = await this.jwtService.signAsync({ id: user.id });

      res.cookie('auth', jwt, { httpOnly: true });

      finalResponse(res, HttpStatus.OK);
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth');
    finalResponse(res, HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Res() res: Response, @Req() req: Request) {
    try {
      const cookie = req.cookies['auth'];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }

      const user = await this.authService.authPermissions(data['id']);
      const { password: _, ...rest } = user;

      finalResponse(res, HttpStatus.OK, { data: rest });
    } catch (e) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('EDIT_USER')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put('grantRole')
  async grandRole(
    @Res() res: Response,
    @Body('userId') userId: string,
    @Body('roleId') roleId: string,
  ) {
    try {
      const user = await this.authService.findOne({ id: userId });
      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }

      if (roleId) {
        const role = await this.roleService.getRole({ id: roleId });
        if (!role) {
          return new NotFoundException(Exception.ROLE_NOT_FOUND);
        }
        user.role = role;
      }

      const updatedUser = await this.authService.save(user);

      finalResponse(res, HttpStatus.OK, { data: updatedUser });
    } catch (err) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @hasPermissions('VIEW_USER')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('user/filter')
  async getAllUser(
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

      const { result, total } = await this.authService.filterUser(query);

      finalResponse(res, HttpStatus.OK, {
        data: result,
        paging: { ...paging, keyword: keyword, total },
      });
    } catch (err) {
      console.log(err);
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('user')
  async updateUser(
    @Res() res: Response,
    @Req() req: Request,
    @Body('name') name: string,
    @Body('birthday') birthday: Date,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    try {
      const cookie = req.cookies['auth'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const user = await this.authService.findOne({ id: data['id'] });
      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }

      user.name = name ? name : user.name;
      user.birthday = birthday ? birthday : user.birthday;
      user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;

      const savedUser = await this.authService.save(user);

      finalResponse(res, HttpStatus.OK, { data: savedUser });
    } catch (e) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user')
  async deactiveUser(@Res() res: Response, @Req() req: Request) {
    try {
      const cookie = req.cookies['auth'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const user = await this.authService.findOne({ id: data['id'] });
      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }

      user.isActive = false;

      const { isActive } = await this.authService.save(user);
      finalResponse(res, HttpStatus.OK, { data: { isActive } });
    } catch (e) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  async uploadAvatar(
    @Res() res: Response,
    @Req() req: Request,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    try {
      const cookie = req.cookies['auth'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
      }
      const user = await this.authService.findOne({ id: data['id'] });
      if (!user) {
        return new NotFoundException(Exception.USER_NOT_FOUND);
      }

      user.avatarUrl = avatarUrl ? avatarUrl : user.avatarUrl;

      const savedUser = await this.authService.save(user);

      finalResponse(res, HttpStatus.OK, { data: savedUser });
    } catch (e) {
      finalResponse(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
