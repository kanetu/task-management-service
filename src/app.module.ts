import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from './auth/auth.module';
import {PermissionModule} from './permission/permission.module';
import EntityCombine from "./entities/index";
import {RoleModule} from './role/role.module';
import {ScheduleModule} from './schedule/schedule.module';
import {TaskModule} from './task/task.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
        type: "mysql",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        entities: EntityCombine,
        synchronize: true,
    }),
    
    AuthModule,
    PermissionModule,
    RoleModule,
    ScheduleModule,
    TaskModule,
    ProjectModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}  
