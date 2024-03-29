import { celebrate, Joi } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import { Container } from 'typedi';
import { User } from '../../../models/User';
import AuthService from '../../../services/auth';
import middlewares from '../../middlewares';
import DiscordOauth2 from 'discord-oauth2';

const route = Router();

export default (app) => {
  app.use('/auth', route);

  route.post(
    '/register',
    celebrate({
      body: Joi.object({
        name: Joi.string().min(2).max(30).required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(8).max(30).required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignUp(req.body as User);
        return res.json({ user, token }).status(201);
      } catch (e) {
        console.log(' error ', e);
        return next(e);
      }
    },
  );

  route.post('/discord', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      const authServiceInstance = Container.get(AuthService);
      const discordAuth = new DiscordOauth2();
      const discordUser = await discordAuth.getUser(token as string);
      console.log(discordUser);
      const user = await authServiceInstance.Discord(discordUser);
      return res.json({ ...user }).status(200);
    } catch (e) {
      console.log(' error ', e);
      return next(e);
    }
  }),
    route.post(
      '/login',
      celebrate({
        body: Joi.object({
          email: Joi.string().trim().email().required(),
          password: Joi.string().min(8).max(30).required(),
        }),
      }),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { email, password } = req.body;
          const authServiceInstance = Container.get(AuthService);
          const { user, token } = await authServiceInstance.SignIn(email, password);
          return res.json({ user, token }).status(200);
        } catch (e) {
          console.log(' error ', e);
          return next(e);
        }
      },
    );

  route.post(
    '/logout',
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // @TODO AuthService.Logout(req.user) for doing some other stuffff
        return res.status(200).end();
      } catch (e) {
        console.log(' error ', e);
        return next(e);
      }
    },
  );
};
