import { Module } from '@nestjs/common';
import { MintsController } from './controllers/mints/mints.controller';
import { MintsService } from './services/mints/mints.service';

@Module({
  controllers: [MintsController],
  providers: [MintsService],
})
export class MintsModule {}
