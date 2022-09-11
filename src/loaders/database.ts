import Container from 'typedi';
import { Connection, createConnection, useContainer } from 'typeorm';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import config from '../config';
import { User } from '../models/User';
import { Accounts } from '../models/Accounts';

export default async (): Promise<Connection> => {
  // read connection options from ormconfig file (or ENV variables)
  // const connectionOptions = await getConnectionOptions();
  const connectionOptions: MongoConnectionOptions = {
    type: 'mongodb',
    url: 'mongodb+srv://everkers:Kalalin800@zed.rnh4w.mongodb.net/leagueShowcase?retryWrites=true&w=majority',
    synchronize: false,
    logging: true,
    // useNewUrlParser: true,
    entities: [User, Accounts],
  };

  // typedi + typeorm
  useContainer(Container);

  // create a connection using modified connection options
  const connection = await createConnection(connectionOptions);

  return connection;
};
