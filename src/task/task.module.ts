import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { ProjectModule } from 'src/project/project.module';
import { SharedModule } from 'src/shared/shared.module';
import { TaskCommentModule } from 'src/task-comment/task-comment.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Task]),
    ProjectModule,
    TaskCommentModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
