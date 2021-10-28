import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  savePermission(data: any): Promise<Permission> {
    return this.permissionRepository.save(data);
  }

  findPermission(condition: any): Promise<Permission> {
    return this.permissionRepository.findOne(condition);
  }

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }
}
