import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const whiteList = ['http://localhost:4200', 'https://app.task-management.tk', undefined];
  app.enableCors({
    credentials: true,
    origin: function (origin, callback) {
      console.log('origin ->', origin);
      if (whiteList.includes(origin)) {
        console.log('allow cors for: ', origin);
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
