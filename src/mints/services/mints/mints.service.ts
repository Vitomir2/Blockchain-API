import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { ethers } from 'ethers';

import * as whitelists from 'src/whitelists/VNFT-whitelist.json';

type signingData = {
  from: string;
  to: string;
  contents: any;
};

@Injectable()
export class MintsService {
  private readonly provider;

  async checkAllowance(address: string) {
    console.log('addr: ', address);
    console.log('WL: ', whitelists[address]);
    let allowance = {
      isAllowed: false,
    };

    if (whitelists[address]) {
      if (
        !whitelists[address].signature ||
        whitelists[address].signature === ''
      ) {
        whitelists[address].isAllowed = true;
        whitelists[address].signature = 'testing signature';
        // ethers.eth
        // fs.writeFileSync(
        //   'src/whitelists/VNFT-whitelist.json',
        //   JSON.stringify(whitelists),
        // );
      }

      allowance = whitelists[address];
    }

    return allowance;
  }

  private signMessage(privateKey: Buffer, message: any): string {
    this.provider = new ethers.AlchemyProvider(
      ethers,
      configService.get('ALCHEMY_SEPOLIA_KEY'),
    );

    const domain = {
      // Specify the EIP-712 domain data
      name: 'VNFT',
      version: '1.0',
      chainId: 11155111, // Replace with the desired chain ID
      verifyingContract: '0xYourContractAddress', // Replace with the contract address
    };

    const typedData = {
      types: {
        // Define the types used in the EIP-712 signature
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Allowance: [
          // Define the structure of your message
          { name: 'minter', type: 'address' },
          { name: 'isAllowed', type: 'boolean' },
          { name: 'mintPrice', type: 'uint256' },
          { name: 'maxMint', type: 'uint8' },
          { name: 'signature', type: 'string' },
        ],
      },
      primaryType: 'Allowance',
      domain,
      message,
    };

    const signature = ethers.signer;

    return signature;
  }
}
