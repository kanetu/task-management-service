import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {User} from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
        type: "mysql",
        host: "103.130.216.96",
        port: 3306,
        username: "kkkcom_admin",
        password: "kanetu123",
        database: "kkkcom_task_management",
        entities: [User],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
        secret: "kanet",
        signOptions: {expiresIn: "1d"}
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
