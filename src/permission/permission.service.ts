import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Permission} from "src/entities/permission.entity";
import {Repository} from "typeorm";


@Injectable()
export class PermissionService {

    constructor(@InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>){}

    async savePermission(data: any): Promise<Permission>{
        return this.permissionRepository.save(data);
    }

    async findPermission(condition: any): Promise<Permission>{
        return this.permissionRepository.findOne(condition)
    }
    

}
