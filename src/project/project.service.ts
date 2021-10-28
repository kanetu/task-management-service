import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  saveProject(data: any): Promise<Project> {
    return this.projectRepository.save(data);
  }

  findProject(condition: any): Promise<Project> {
    return this.projectRepository.findOne(condition);
  }

  findAll(conditions?: any): Promise<Project[]> {
    return this.projectRepository.find(conditions);
  }
}
