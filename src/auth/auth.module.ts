import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {JwtAuthGuard} from 'src/guards/jwt-auth.guard';
import {JwtAuthStrategy} from 'src/strategiges/jwt-auth.strategy';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: "1d"}
    }), 
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule{}  
