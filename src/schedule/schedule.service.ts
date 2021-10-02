import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Schedule} from "src/entities/schedule.entity";
import {Repository} from "typeorm";



@Injectable()
export class ScheduleService{
    constructor(@InjectRepository(Schedule) private readonly scheduleRepository: Repository<Schedule>){}

    saveSchedule(data: any): Promise<Schedule>{
        return this.scheduleRepository.save(data);
    }
    
    getSchedule (condition: any): Promise<Schedule>{
        return this.scheduleRepository.findOne(condition)
    }                                                   

    getAllSchedule(condition: any): Promise<Schedule[]>{
        return this.scheduleRepository.find(condition)
    }

    deleteSchedule(schedule: Schedule): Promise<Schedule> {
        return this.scheduleRepository.remove(schedule)
    }
        
}
