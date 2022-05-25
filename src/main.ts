import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());

  const whiteList = [
    'http://localhost:4200',
    'https://app.task-management.tk',
    undefined,
  ];
  app.enableCors({
    credentials: true,
    origin: function (origin, callback) {
      if (whiteList.includes(origin)) {
        callback(null, true);
      }
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
