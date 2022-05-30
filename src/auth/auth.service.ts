import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { IFilterUserQuery } from 'src/models/queries/IFilterUserQuery';
import { Like, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  save(data: any): Promise<User> {
    return this.userRepository.save(data);
  }

  findOne(condition: any): Promise<User> {
    return this.userRepository.findOne(condition);
  }

  findUserWithPassword(email: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async filterUser(
    query: IFilterUserQuery,
  ): Promise<{ result: User[]; total: number }> {
    const [result, total] = await this.userRepository.findAndCount({
      where: { name: Like(`%${query.keyword}%`) },
      order: { name: 'DESC' },
      take: query.take,
      skip: query.skip,
    });
    return {
      result,
      total,
    };
  }

  authPermissions(userId: string): Promise<any> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where({ id: userId })
      .getOne();
  }
}
