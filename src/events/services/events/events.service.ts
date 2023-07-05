import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';

import * as WETH_ABI from 'src/events/abis/WETH-abi.json';
import { DepositEvent } from 'src/typeorm/depositEvent.entity';
import { CreateDepositEventDto } from 'src/events/dtos/CreateDepositEvent.dto';

@Injectable()
export class EventsService {
  private readonly provider;

  constructor(
    @InjectRepository(DepositEvent)
    private readonly depositEventRepository: Repository<DepositEvent>,
    private readonly configService: ConfigService,
  ) {
    this.provider = new ethers.WebSocketProvider(
      configService.get('ALCHEMY_WEBSOCKETS_URL'),
    );
  }

  async getLatestEthereumBlock() {
    //* Get the latest block
    const latestBlock = await this.provider.getBlockNumber();
    return latestBlock;
  }

  async activateWETHDepositListener() {
    const WETHaddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const contract = new ethers.Contract(WETHaddress, WETH_ABI, this.provider);

    contract.on('Deposit', (dst, wad) => {
      const createDepositEventDto: CreateDepositEventDto = {
        sender: dst,
        amount: Number(ethers.formatEther(wad)),
        currency: 'ETH',
      };

      console.log('createDepositEventDto: ', createDepositEventDto);

      const newDepositEvent = this.depositEventRepository.create(
        createDepositEventDto,
      );

      this.depositEventRepository.save(newDepositEvent);
    });

    return 'Event listener is activated.';
  }

  async getDepositEvents() {
    return await this.depositEventRepository.find();
  }

  async getDepositEventByAddress(address: string) {
    return await this.depositEventRepository.find({
      where: {
        sender: address,
      },
    });
  }
}
