import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { Repository, UsingJoinColumnOnlyOnOneSideAllowedError } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import config from '../config';
import { Exception } from '../Exception';
import DiscordOauth2 from 'discord-oauth2';
import { User } from '../models/User';

@Service()
export default class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  public async SignUp(inputUser: User): Promise<{ user: User; token: string }> {
    try {
      const salt = randomBytes(32);

      /**
       * Hash password first
       */
      const hashedPassword = await argon2.hash(inputUser.password, { salt });
      const userRecord = await this.userRepository.save({
        ...inputUser,
        salt: salt.toString('hex'),
        password: hashedPassword,
      });

      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }

      //   await this.mailer.SendWelcomeEmail(userRecord);

      const user = userRecord;
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (error) {
      if (error.name === 'MongoError' && error.code === 11000) {
        // Duplicate username
        throw new Error('User already exist!');
      }
      console.log(error);
      throw error;
    }
  }

  public async Discord(user: DiscordOauth2.User): Promise<{ user: User; token: string }> {
    const record = await this.userRepository.findOne({ where: { email: user.email } });
    if (!record) {
      const userRecord = await this.userRepository.save({
        name: user.username,
        email: user.email,
        picture: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      });
      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      const token = this.generateToken(userRecord);
      return { user: userRecord, token };
    } else {
      const token = this.generateToken(record);
      return { user: record, token };
    }
  }
  public async SignIn(email: string, password: string): Promise<{ user: User; token: string }> {
    const record = await this.userRepository.findOne({ where: { email } });

    if (!record) {
      throw new Exception('User not found!', 404);
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    const validPassword = await argon2.verify(record.password, password);
    if (validPassword) {
      const token = this.generateToken(record);
      const user = record;
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      /**
       * Return user and token
       */
      return { user, token };
    } else {
      throw new Error('Invalid Password');
    }
  }

  private generateToken(user: User): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        id: user.id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }
}
