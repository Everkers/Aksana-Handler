import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { lowercase } from './ValueTransformers';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

@Entity()
export class User {
  @ObjectIdColumn()
  public id: ObjectID;

  @Column()
  public name: string;

  @Column()
  public picture: string;

  @Column()
  public accounts: unknown[];

  @Column()
  public discord: string;

  @Index({ unique: true })
  @Column({
    unique: true,
    nullable: false,
    transformer: [lowercase],
  })
  public email: string;

  @Column({
    select: false,
    nullable: false,
  })
  public password: string;

  @Column({
    select: false,
    nullable: false,
  })
  public salt: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  public role: Role = Role.User;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
