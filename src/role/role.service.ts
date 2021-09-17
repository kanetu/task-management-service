import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Permission} from "src/entities/permission.entity";
import {Role} from "src/entities/role.entity";
import { Repository} from "typeorm";



@Injectable()
export class RoleService {
    constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>){}

    async saveRole(data: any): Promise<Role> {
        return this.roleRepository.save(data);
    }

    async getAllRole(condition?:any): Promise<Role[]>{
        return this.roleRepository.find(condition);
    }

    async getRole(condition: any): Promise<Role>{
        return this.roleRepository.findOne(condition)
    }

}
