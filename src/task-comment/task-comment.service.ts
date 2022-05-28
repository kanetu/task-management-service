import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskComment } from 'src/entities/task-comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskCommentService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly taskCommentRepository: Repository<TaskComment>,
  ) {}

  getComment(data: any): Promise<TaskComment> {
    return this.taskCommentRepository.findOne(data);
  }

  saveComment(data: any): Promise<TaskComment> {
    return this.taskCommentRepository.save(data);
  }

  removeComment(comment: TaskComment): Promise<TaskComment> {
    return this.taskCommentRepository.remove(comment);
  }
}
