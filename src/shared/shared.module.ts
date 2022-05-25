import { Module } from '@nestjs/common';
import * as moment from 'moment';
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'MomentWrapper',
      useValue: moment,
    },
  ],
  exports: [
    {
      provide: 'MomentWrapper',
      useValue: moment,
    },
  ],
})
export class SharedModule {}
