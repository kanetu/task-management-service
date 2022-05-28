import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskComment } from 'src/entities/task-comment.entity';
import { TaskCommentService } from './task-comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskComment])],
  providers: [TaskCommentService],
  exports: [TaskCommentService],
})
export class TaskCommentModule {}
