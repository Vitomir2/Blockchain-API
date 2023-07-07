import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { MintsService } from 'src/mints/services/mints/mints.service';

@Controller('mints')
export class MintsController {
  constructor(private readonly mintsService: MintsService) {}

  @Get('isAllowed/:address')
  async isAllowed(@Param('address') address: string) {
    const allowance = await this.mintsService.checkAllowance(address);
    if (allowance && allowance.signature && allowance.minter === address)
      return allowance;

    return 'You are not allowed to mint!';
  }

  @Get('verify')
  async verify(@Body() request) {
    if (!request) throw new BadRequestException('Invalid Request!');

    const properties = Object.keys(request.message);
    // TODO: better validation handler, if there is time
    if (
      properties.length != 3 ||
      !properties.includes('minter') ||
      !properties.includes('mintPrice') ||
      !properties.includes('maxMint')
    )
      throw new BadRequestException(
        'Incorrect message properties! You must pass message with minter, mintPrice and maxMint.',
      );

    return this.mintsService.verify(request.message, request.signature);
  }
}
