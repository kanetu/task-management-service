import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Task} from "src/entities/task.entity";
import {Repository} from "typeorm";


@Injectable()
export class TaskService {
    constructor(@InjectRepository(Task) private readonly taskRepository: Repository<Task>){}

    saveTask(data: any): Promise<Task>{
        return this.taskRepository.save(data)
    }

    getTask(condition: any): Promise<Task>{
        return this.taskRepository.findOne(condition);
    }

    getAllTask(conditions: any): Promise<Task[]>{
        return this.taskRepository.find(conditions);
    }

    deleteTask(data: Task): Promise<Task>{
        return this.taskRepository.remove(data)
    }
}
