import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  saveTask(data: any): Promise<Task> {
    return this.taskRepository.save(data);
  }

  getTask(condition: any): Promise<Task> {
    return this.taskRepository.findOne(condition);
  }

  getTaskWithComment(taskId: string): Promise<any> {
    return this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task',
        'comments.id',
        'comments.content',
        'comments.createAt',
        'comments.updateAt',
        'user.name',
        'user.email',
        'user.avatarUrl',
      ])
      .leftJoin('task.comments', 'comments')
      .leftJoin('comments.user', 'user')
      .where({ id: taskId })
      .getOne();
  }

  getAllTask(conditions: any): Promise<Task[]> {
    return this.taskRepository.find(conditions);
  }

  deleteTask(data: Task): Promise<Task> {
    return this.taskRepository.remove(data);
  }
}
