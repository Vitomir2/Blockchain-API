import { Controller, Get, Param } from '@nestjs/common';
import { MintsService } from 'src/mints/services/mints/mints.service';

@Controller('mints')
export class MintsController {
  constructor(private readonly mintsService: MintsService) {}

  @Get('isAllowed/:address')
  async isAllowed(@Param('address') address: string) {
    const allowance = await this.mintsService.checkAllowance(address);
    if (allowance.isAllowed) return allowance;

    return 'You are not allowed to mint!';
  }
}
