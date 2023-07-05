import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DepositEvent {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'deposit_id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  sender: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: false,
    default: 0,
  })
  amount: number;

  @Column({
    nullable: false,
    default: '',
  })
  currency: string;
}
