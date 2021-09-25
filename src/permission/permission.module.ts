import { forwardRef, Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from 'src/auth/auth.module';
import {Permission} from 'src/entities/permission.entity';
import {PermissionController} from './permission.controller';
import {PermissionService} from './permission.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Permission])
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule{}  
