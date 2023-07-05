import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './controllers/events/events.controller';
import { EventsService } from './services/events/events.service';
import { DepositEvent } from 'src/typeorm/depositEvent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepositEvent])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
