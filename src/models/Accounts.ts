import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './User';

export enum AccountStatus {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Archived = 'ARCHIVED',
}

@Entity()
export class Accounts {
  @ObjectIdColumn()
  public id: ObjectID;

  @Column()
  public championsWithSkins: unknown[];

  @Column()
  public RP: unknown[];

  @Column()
  public allCurrencies: unknown[];

  @Column()
  public loot: unknown[];

  @Column({})
  public userId: ObjectID;

  @Column()
  public honorLevel: unknown[];

  @Column()
  public emotes: unknown[];

  @Column()
  public rankedStats: unknown[];

  @Column()
  public emailVerification: unknown[];

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.Public })
  public status: AccountStatus = AccountStatus.Public;

  @Column()
  public opgg: string;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
