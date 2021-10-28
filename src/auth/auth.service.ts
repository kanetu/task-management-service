import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
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

  findAll(): Promise<User[]> {
    return this.userRepository.find();
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
