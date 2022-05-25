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

  getAllSchedule(date: Date): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      timeStart: MoreThanOrEqual(date),
      timeEnd: LessThanOrEqual(date),
    });
  }

  getAllScheduleBaseOnUser(
    userId: string,
    selectedDate: Date,
  ): Promise<Schedule[]> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.users', 'user')
      .where('schedule.timeStart <= :selectedDate', {
        selectedDate,
      })
      .andWhere('schedule.timeEnd >= :selectedDate', {
        selectedDate,
      })
      .andWhere('user.id = :userId', { userId })
      .getMany();
  }

  deleteSchedule(schedule: Schedule): Promise<Schedule> {
    return this.scheduleRepository.remove(schedule);
  }
}
