import { ObjectId } from 'mongodb';
import { Service } from 'typedi';
import { DeleteResult, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import account from '../api/routes/account';
import { Accounts, AccountStatus } from '../models/Accounts';
@Service()
export default class AccountsService {
  constructor(
    @InjectRepository(Accounts) private readonly accountsRepository: Repository<Accounts>,
  ) {}

  public async delete(id: ObjectID, userId: ObjectID): Promise<DeleteResult> {
    const accountRes = await this.accountsRepository.delete({ id: id, userId: userId });
    return accountRes;
  }

  public async one(userId: ObjectID, id: string) {
    const accountRecord = await this.accountsRepository.findOne({
      where: {
        //@ts-ignore
        _id: new ObjectId(id),
      },
    });

    if (accountRecord.userId.toString() === userId?.toString()) {
      return { ...accountRecord, owner: true };
    } else if (
      accountRecord.userId.toString() !== userId?.toString() &&
      accountRecord.status === AccountStatus.Public
    ) {
      return { ...accountRecord, owner: false };
    } else {
      throw new Error('Account not found');
    }
  }

  public async changePrivacy(privacy: string, id: string, userId: ObjectID) {
    const accountRecord = await this.accountsRepository.findOne({
      where: {
        userId: userId.toString() as any,
        //@ts-ignore
        _id: new ObjectId(id),
      },
    });
    if (accountRecord)
      return this.accountsRepository.save({
        ...accountRecord,
        status: privacy as AccountStatus,
      });
    else {
      throw new Error('Account not found or not authorized');
    }
  }
  public async all(userId: ObjectID) {
    const userAccountsRes = await this.accountsRepository.findBy({
      userId: userId.toString() as any,
    });
    return userAccountsRes;
  }
  public async add(account: any, id: FindOneOptions<Accounts>): Promise<Accounts> {
    try {
      const accountRes = await this.accountsRepository.save({
        ...account,
        userId: id.toString(),
        status: AccountStatus.Public,
      });
      return accountRes;
    } catch (err) {
      console.log(err);
    }
  }
}
