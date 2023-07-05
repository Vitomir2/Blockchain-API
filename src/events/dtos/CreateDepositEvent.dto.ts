import { IsNotEmpty } from 'class-validator';

export class CreateDepositEventDto {
  @IsNotEmpty()
  sender: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  currency: string;
}
