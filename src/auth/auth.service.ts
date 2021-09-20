import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {Repository} from 'typeorm';

@Injectable()
export class AuthService {
    
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){
    
    }

    async save(data: any): Promise<User>{
        return this.userRepository.save(data)
    }

    async findOne(condition: any): Promise<User>{
        return this.userRepository.findOne(condition)
    }
  
    async authPermissions(userId: string): Promise<any> {
        return this.userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .leftJoinAndSelect("role.permissions", "permission")
        .where({id: userId})
        .getOne()
        
    }
}
