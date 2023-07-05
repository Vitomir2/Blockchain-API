import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EventsService } from 'src/events/services/events/events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Get('getLatestBlock')
  async getLatestBlock(@Query() query) {
    if (query.network && query.network.includes('eth'))
      return await this.eventService.getLatestEthereumBlock();

    return 'Unsupported network!';
  }

  @Get('getTransferEvents')
  async getTransferEvents() {
    return await this.eventService.getDepositEvents();
  }

  @Get('getTransferEvent/:address')
  async getDepositEventByAddress(@Param('address') address: string) {
    return await this.eventService.getDepositEventByAddress(address);
  }

  @Post('activateListener')
  async activateListener() {
    return await this.eventService.activateWETHDepositListener();
  }
}
