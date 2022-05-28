import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  saveRole(data: any): Promise<Role> {
    return this.roleRepository.save(data);
  }

  getAllRole(condition?: any): Promise<Role[]> {
    return this.roleRepository.find(condition);
  }

  getRole(condition: any): Promise<Role> {
    return this.roleRepository.findOne(condition);
  }

  removeRole(role: Role): Promise<Role> {
    return this.roleRepository.remove(role);
  }
}
