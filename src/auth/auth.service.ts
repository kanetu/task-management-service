import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { IFilterUserQuery } from 'src/models/queries/IFilterUserQuery';
import { Repository } from 'typeorm';

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
    const [result, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.name', 'ASC')
      .where('user.name LIKE :keyword', { keyword: `%${query.keyword}%` })
      .take(query.take)
      .skip(query.skip)
      .select(['user', 'role.name'])
      .getManyAndCount();
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
