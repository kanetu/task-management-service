import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'MomentWrapper',
      useValue: moment,
    },
  ],
  exports: [
    JwtModule,
    AuthModule,
    {
      provide: 'MomentWrapper',
      useValue: moment,
    },
  ],
})
export class SharedModule {}
