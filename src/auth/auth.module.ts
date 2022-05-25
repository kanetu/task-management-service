import { forwardRef, Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {RoleModule} from 'src/role/role.module';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard} from './guards/permission.guard';
import {JwtAuthStrategy} from './strategiges/jwt-auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: "1d"}
    }), 
    TypeOrmModule.forFeature([User]),
    RoleModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PermissionGuard, JwtAuthStrategy, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule{}  
