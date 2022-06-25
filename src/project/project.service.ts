import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { IFilterProjectQuery } from 'src/models/queries/IFilterProjectQuery';
import { Like, Repository } from 'typeorm';

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

  async filterProjects(
    query: IFilterProjectQuery,
  ): Promise<{ result: Project[]; total: number }> {
    const [result, total] = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.users', 'user')
      .orderBy('project.name', 'DESC')
      .where('project.name LIKE :keyword', { keyword: `%${query.keyword}%` })
      .take(query.take)
      .skip(query.skip)
      .getManyAndCount();

    return {
      result,
      total,
    };
  }
}
