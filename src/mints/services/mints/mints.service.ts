import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { ethers } from 'ethers';

import * as whitelists from 'src/whitelists/VNFT-whitelist.json';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MintsService {
  private readonly provider;
  private typedData;

  constructor(private readonly configService: ConfigService) {
    const network = ethers.Network.from(11155111);
    this.provider = new ethers.AlchemyProvider(
      network,
      configService.get('ALCHEMY_SEPOLIA_KEY'),
    );

    this.typedData = {
      domain: {
        name: 'VNFT',
        version: '1.0',
        chainId: 11155111, // Replace with the desired chain ID
        verifyingContract: this.configService.get('VERIFYING_CONTRACT'), // Replace with the contract address
      },
      types: {
        Message: [
          // Define the structure of your message
          { name: 'minter', type: 'address' },
          { name: 'mintPrice', type: 'uint256' },
          { name: 'maxMint', type: 'uint8' },
        ],
      },
    };
  }

  async checkAllowance(address: string) {
    let allowance = null;

    if (whitelists[address]) {
      whitelists[address].minter = address;
      whitelists[address].signature = await this.signMessage(
        whitelists[address],
      );

      fs.writeFileSync(
        'src/whitelists/VNFT-whitelist.json',
        JSON.stringify(whitelists),
      );

      allowance = whitelists[address];
    }

    return allowance;
  }

  private async signMessage(message: any): Promise<string> {
    const stringPrice =
      typeof message.mintPrice === 'string'
        ? message.mintPrice
        : message.mintPrice.toString();

    const singTypedData = {
      domain: this.typedData.domain,
      types: this.typedData.types,
      primaryType: 'Message',
      message: {
        minter: message.minter,
        mintPrice: ethers.parseEther(stringPrice),
        maxMint: message.maxMint,
      },
    };

    const privateKey = this.configService.get('SIGNER_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const signature = await wallet.signTypedData(
      singTypedData.domain,
      singTypedData.types,
      singTypedData.message,
    );

    return signature;
  }

  verify(message: any, signature: string): string {
    if (typeof message.mintPrice !== 'string')
      message.mintPrice = message.mintPrice.toString();

    message.mintPrice = ethers.parseEther(message.mintPrice);

    const address = ethers.verifyTypedData(
      this.typedData.domain,
      this.typedData.types,
      message,
      signature,
    );

    return address;
  }
}
