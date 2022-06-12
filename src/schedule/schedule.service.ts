import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  saveSchedule(data: any): Promise<Schedule> {
    return this.scheduleRepository.save(data);
  }

  getSchedule(condition: any): Promise<Schedule> {
    return this.scheduleRepository.findOne(condition);
  }

  getAllScheduleInRange(
    firstDate: Date,
    secondDate: Date,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      timeStart: MoreThanOrEqual(firstDate),
      timeEnd: LessThanOrEqual(secondDate),
    });
  }

  getAllScheduleBaseOnSelectedDate(
    userId: string,
    selectedDate: Date,
  ): Promise<Schedule[]> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.users', 'user')
      .where('DATE(schedule.timeStart) <= DATE(:selectedDate)', {
        selectedDate,
      })
      .andWhere('DATE(schedule.timeEnd) >= DATE(:selectedDate)', {
        selectedDate,
      })
      .andWhere('user.id = :userId', { userId })
      .getMany();
  }

  deleteSchedule(schedule: Schedule): Promise<Schedule> {
    return this.scheduleRepository.remove(schedule);
  }
}
