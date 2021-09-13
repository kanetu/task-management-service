import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {User} from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
        type: "mysql",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        entities: [User],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: "1d"}
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
